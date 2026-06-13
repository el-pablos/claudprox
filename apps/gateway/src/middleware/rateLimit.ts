// Middleware rate limit per subscription.
// Sliding-window in-memory: simpan timestamp request per subscriptionId, hitung
// jumlah dalam jendela 60 detik terakhir, bandingkan dengan plan.rateLimitRpm.
// Harus dijalankan SETELAH quotaGuard (butuh request.subscription).

import type { FastifyReply, FastifyRequest } from "fastify";

const WINDOW_MS = 60_000;

// Map subscriptionId -> daftar timestamp (ms) request dalam jendela aktif.
const windows = new Map<string, number[]>();

/**
 * preHandler rate limit. Tidak butuh dependency eksternal sehingga dibuat
 * sebagai fungsi biasa, bukan factory.
 */
export async function rateLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const subscription = request.subscription;
  if (subscription === undefined) {
    await reply.code(403).send({
      error: { type: "subscription_expired", message: "Subscription tidak tersedia" },
    });
    return;
  }

  const limit = subscription.plan.rateLimitRpm;
  const now = Date.now();
  const threshold = now - WINDOW_MS;

  const timestamps = windows.get(subscription.id) ?? [];
  // Buang timestamp di luar jendela.
  const recent = timestamps.filter((ts) => ts > threshold);

  if (recent.length >= limit) {
    windows.set(subscription.id, recent);
    await reply.code(429).send({
      error: { type: "rate_limited", message: "Terlalu banyak permintaan" },
    });
    return;
  }

  recent.push(now);
  windows.set(subscription.id, recent);
}

/** Kosongkan state rate limit (dipakai pada pengujian). */
export function clearRateLimitState(): void {
  windows.clear();
}
