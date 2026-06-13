// Token meter: ekstraksi usage dari respons upstream, estimasi fallback,
// dan dekrement kuota subscription secara atomik.

import { encode } from "gpt-tokenizer";
import { Prisma, type PrismaClient } from "@prisma/client";
import type { UpstreamUsage } from "@claudprox/shared";

/** Hasil ekstraksi token dari respons upstream. */
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  /** true bila angka berasal dari estimasi lokal, bukan dari upstream. */
  estimated: boolean;
}

/**
 * Ambil usage dari body respons OpenAI-compatible.
 * @returns TokenUsage bila field usage lengkap; null bila tidak tersedia.
 */
export function extractUsage(responseBody: unknown): TokenUsage | null {
  if (typeof responseBody !== "object" || responseBody === null) {
    return null;
  }
  const usage = (responseBody as { usage?: Partial<UpstreamUsage> }).usage;
  if (usage === undefined || usage === null) {
    return null;
  }

  const prompt = usage.prompt_tokens;
  const completion = usage.completion_tokens;
  const total = usage.total_tokens;

  if (typeof prompt !== "number" || typeof completion !== "number") {
    return null;
  }

  const totalTokens = typeof total === "number" ? total : prompt + completion;
  return {
    promptTokens: prompt,
    completionTokens: completion,
    totalTokens,
    estimated: false,
  };
}

/**
 * Estimasi jumlah token dari teks menggunakan gpt-tokenizer.
 * Dipakai sebagai fallback bila upstream tidak mengirim usage.
 */
export function estimateTokens(text: string): number {
  if (text === "") {
    return 0;
  }
  return encode(text).length;
}

/** Hasil dekrement kuota. */
export interface DecrementResult {
  /** true bila kuota mencukupi dan berhasil dikurangi. */
  ok: boolean;
  /** Sisa token setelah operasi. */
  remaining: bigint;
}

/**
 * Kurangi kuota token subscription secara ATOMIK.
 *
 * Memakai updateMany dengan kondisi tokensRemaining >= used sehingga tidak
 * mungkin menjadi negatif meski ada request paralel. Bila kuota tidak cukup,
 * sisa di-set 0 agar guard berikutnya menolak request.
 */
export async function decrementTokens(
  prisma: PrismaClient,
  subscriptionId: string,
  used: number,
): Promise<DecrementResult> {
  const usedBig = BigInt(Math.max(0, Math.trunc(used)));

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updated = await tx.subscription.updateMany({
      where: {
        id: subscriptionId,
        tokensRemaining: { gte: usedBig },
      },
      data: {
        tokensRemaining: { decrement: usedBig },
      },
    });

    if (updated.count === 0) {
      // Kuota tidak cukup: set sisa ke 0 (jangan biarkan minus).
      await tx.subscription.update({
        where: { id: subscriptionId },
        data: { tokensRemaining: 0n },
      });
      return { ok: false, remaining: 0n };
    }

    const current = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      select: { tokensRemaining: true },
    });
    return { ok: true, remaining: current?.tokensRemaining ?? 0n };
  });
}
