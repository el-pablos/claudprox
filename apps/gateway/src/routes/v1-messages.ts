// Route POST /v1/messages (Anthropic-style).
// CATATAN: endpoint /v1/messages upstream BELUM diuji langsung (lihat ENGINEERING.md).
// Implementasi mengikuti pola yang sama dengan /v1/chat/completions dan ditandai
// sebagai best-effort. Format usage Anthropic berbeda (input_tokens/output_tokens),
// jadi ekstraksi token menangani kedua bentuk.

import { z } from "zod";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { toUpstreamModel } from "../lib/modelTransform.js";
import { forwardMessages } from "../lib/upstream.js";
import { decrementTokens } from "../lib/tokenMeter.js";
import { pipeSse } from "../lib/sseProxy.js";

const messagesBodySchema = z
  .object({
    model: z.string().min(1),
    stream: z.boolean().optional(),
  })
  .passthrough();

/** Usage gaya Anthropic: {input_tokens, output_tokens}. */
interface AnthropicUsage {
  input_tokens?: number;
  output_tokens?: number;
}

/** Ambil total token dari respons Anthropic-style; 0 bila tidak tersedia. */
function extractAnthropicTotal(payload: unknown): { total: number; input: number; output: number } {
  if (typeof payload !== "object" || payload === null) {
    return { total: 0, input: 0, output: 0 };
  }
  const usage = (payload as { usage?: AnthropicUsage }).usage;
  if (usage === undefined || usage === null) {
    return { total: 0, input: 0, output: 0 };
  }
  const input = typeof usage.input_tokens === "number" ? usage.input_tokens : 0;
  const output = typeof usage.output_tokens === "number" ? usage.output_tokens : 0;
  return { total: input + output, input, output };
}

export async function registerMessagesRoute(app: FastifyInstance): Promise<void> {
  app.post("/v1/messages", async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = messagesBodySchema.safeParse(request.body);
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
  const response = await forwardMessages(upstreamBody, false);
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    await reply.code(502).send({
      error: { type: "upstream_error", message: "Layanan model membalas error" },
    });
    return;
  }

  const { total, input, output } = extractAnthropicTotal(payload);
  await recordUsageAndDecrement(request, userModel, total, input, output, false);

  const userPayload = { ...payload, model: userModel };
  await reply.code(200).send(userPayload);
}

async function handleStream(
  request: FastifyRequest,
  reply: FastifyReply,
  upstreamBody: Record<string, unknown>,
  userModel: string,
): Promise<void> {
  const response = await forwardMessages(upstreamBody, true);

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

  // pipeSse menangkap usage gaya OpenAI; untuk Anthropic, usage sering tidak
  // tertangkap di sini, jadi total bisa 0 (best-effort sesuai catatan).
  const usage = await pipeSse(response.body, reply);
  const total = usage?.totalTokens ?? 0;
  await recordUsageAndDecrement(request, userModel, total, total, 0, usage?.estimated ?? false);
}

async function recordUsageAndDecrement(
  request: FastifyRequest,
  userModel: string,
  total: number,
  input: number,
  output: number,
  estimated: boolean,
): Promise<void> {
  const subscription = request.subscription;
  const apiKeyCtx = request.apiKeyCtx;
  if (subscription === undefined || apiKeyCtx === undefined) {
    return;
  }

  if (total > 0) {
    await decrementTokens(request.server.prisma, subscription.id, total);
  }

  await request.server.prisma.usageLog.create({
    data: {
      userId: apiKeyCtx.userId,
      subscriptionId: subscription.id,
      apiKeyId: apiKeyCtx.apiKeyId,
      model: userModel,
      promptTokens: input,
      completionTokens: output,
      totalTokens: total,
      estimated,
    },
  });
}
