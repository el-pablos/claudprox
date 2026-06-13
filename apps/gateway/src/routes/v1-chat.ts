// Route POST /v1/chat/completions.
// Validasi model, transform ke model upstream, teruskan ke proxy.
// Non-stream: ambil usage, dekrement kuota, catat UsageLog, balas model versi user.
// Stream: pipe SSE, dekrement setelah stream selesai.

import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { toUpstreamModel } from "../lib/modelTransform.js";
import { forwardChat } from "../lib/upstream.js";
import { decrementTokens, extractUsage } from "../lib/tokenMeter.js";
import { pipeSse } from "../lib/sseProxy.js";

// Hanya field yang dibutuhkan gateway divalidasi ketat; sisanya diteruskan apa adanya.
const chatBodySchema = z
  .object({
    model: z.string().min(1),
    stream: z.boolean().optional(),
  })
  .passthrough();

export async function registerChatRoute(app: FastifyInstance): Promise<void> {
  app.post("/v1/chat/completions", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = chatBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { type: "bad_request", message: "Body permintaan tidak valid" },
      });
    }

    const body = parsed.data;
    let upstreamModel: string;
    try {
      upstreamModel = toUpstreamModel(body.model);
    } catch {
      return reply.code(400).send({
        error: { type: "invalid_model", message: `Model tidak dikenal: ${body.model}` },
      });
    }

    const subscription = request.subscription;
    const apiKeyCtx = request.apiKeyCtx;
    if (subscription === undefined || apiKeyCtx === undefined) {
      return reply.code(401).send({
        error: { type: "invalid_api_key", message: "Konteks permintaan tidak lengkap" },
      });
    }

    const userModel = body.model;
    const upstreamBody = { ...body, model: upstreamModel };
    const isStream = body.stream === true;

    if (isStream) {
      return handleStream(request, reply, upstreamBody, userModel);
    }
    return handleNonStream(request, reply, upstreamBody, userModel);
  });
}

async function handleNonStream(
  request: FastifyRequest,
  reply: FastifyReply,
  upstreamBody: Record<string, unknown>,
  userModel: string,
): Promise<void> {
  const response = await forwardChat(upstreamBody, false);
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    // Teruskan status error upstream tanpa membocorkan detail internal.
    await reply.code(502).send({
      error: { type: "upstream_error", message: "Layanan model membalas error" },
    });
    return;
  }

  const usage = extractUsage(payload);
  const used = usage?.totalTokens ?? 0;

  await recordUsageAndDecrement(request, userModel, used, usage?.estimated ?? false);

  // Kembalikan model versi user, bukan versi upstream.
  const userPayload = { ...payload, model: userModel };
  await reply.code(200).send(userPayload);
}

async function handleStream(
  request: FastifyRequest,
  reply: FastifyReply,
  upstreamBody: Record<string, unknown>,
  userModel: string,
): Promise<void> {
  const response = await forwardChat(upstreamBody, true);

  if (!response.ok || response.body === null) {
    await reply.code(502).send({
      error: { type: "upstream_error", message: "Layanan model membalas error" },
    });
    return;
  }

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const usage = await pipeSse(response.body, reply);
  const used = usage?.totalTokens ?? 0;

  // Dekrement setelah stream selesai (token baru diketahui di akhir).
  await recordUsageAndDecrement(request, userModel, used, usage?.estimated ?? false);
}

/** Catat UsageLog dan dekrement kuota subscription bila ada token terpakai. */
async function recordUsageAndDecrement(
  request: FastifyRequest,
  userModel: string,
  used: number,
  estimated: boolean,
): Promise<void> {
  const subscription = request.subscription;
  const apiKeyCtx = request.apiKeyCtx;
  if (subscription === undefined || apiKeyCtx === undefined) {
    return;
  }

  const usage = extractUsageBreakdown(request, used);

  if (used > 0) {
    await decrementTokens(request.server.prisma, subscription.id, used);
  }

  await request.server.prisma.usageLog.create({
    data: {
      userId: apiKeyCtx.userId,
      subscriptionId: subscription.id,
      apiKeyId: apiKeyCtx.apiKeyId,
      model: userModel,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: used,
      estimated,
    },
  });
}

interface UsageBreakdown {
  promptTokens: number;
  completionTokens: number;
}

/**
 * Pecah total token menjadi prompt/completion bila tersedia.
 * Saat hanya total yang diketahui (stream), prompt diisi total dan completion 0
 * sebagai catatan kasar; total tetap akurat untuk billing.
 */
function extractUsageBreakdown(_request: FastifyRequest, total: number): UsageBreakdown {
  return { promptTokens: total, completionTokens: 0 };
}
