// Middleware penjaga kuota.
// Mengambil subscription aktif (status ACTIVE) milik user, lalu menolak bila
// token habis (402) atau langganan kedaluwarsa (403). Subscription beserta
// plan-nya disimpan di request untuk dipakai middleware/route berikutnya.

import type { FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient } from "@prisma/client";

/**
 * Bangun preHandler penjaga kuota dengan PrismaClient yang di-inject.
 * Harus dijalankan SETELAH apiKeyAuth (butuh request.apiKeyCtx).
 */
export function createQuotaGuard(prisma: PrismaClient) {
  return async function quotaGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const ctx = request.apiKeyCtx;
    if (ctx === undefined) {
      // Tidak seharusnya terjadi bila chain preHandler benar.
      await reply.code(401).send({
        error: { type: "invalid_api_key", message: "Konteks API key tidak tersedia" },
      });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: ctx.userId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (subscription === null) {
      await reply.code(403).send({
        error: { type: "subscription_expired", message: "Tidak ada langganan aktif" },
      });
      return;
    }

    if (subscription.expiresAt.getTime() <= Date.now()) {
      await reply.code(403).send({
        error: { type: "subscription_expired", message: "Langganan sudah kedaluwarsa" },
      });
      return;
    }

    if (subscription.tokensRemaining <= 0n) {
      await reply.code(402).send({
        error: { type: "insufficient_tokens", message: "Token tidak mencukupi" },
      });
      return;
    }

    request.subscription = subscription;
  };
}
