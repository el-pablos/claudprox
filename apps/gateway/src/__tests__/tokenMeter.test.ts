// Test token meter: extract usage, estimate, decrement atomik.

import { describe, it, expect, vi } from "vitest";
import { extractUsage, estimateTokens, decrementTokens } from "../lib/tokenMeter.js";
import type { PrismaClient } from "@prisma/client";

describe("extractUsage", () => {
  it("mengambil usage lengkap dari respons OpenAI", () => {
    const body = {
      usage: { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 },
    };
    const usage = extractUsage(body);
    expect(usage).toEqual({
      promptTokens: 100,
      completionTokens: 20,
      totalTokens: 120,
      estimated: false,
    });
  });

  it("menghitung total bila hanya prompt+completion tersedia", () => {
    const body = { usage: { prompt_tokens: 5, completion_tokens: 7 } };
    const usage = extractUsage(body);
    expect(usage?.totalTokens).toBe(12);
  });

  it("mengembalikan null bila usage tidak ada", () => {
    expect(extractUsage({})).toBeNull();
    expect(extractUsage(null)).toBeNull();
    expect(extractUsage("bukan-objek")).toBeNull();
    expect(extractUsage({ usage: { prompt_tokens: "x" } })).toBeNull();
  });
});

describe("estimateTokens", () => {
  it("mengembalikan 0 untuk string kosong", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("mengembalikan jumlah token > 0 untuk teks biasa", () => {
    expect(estimateTokens("halo dunia ini contoh")).toBeGreaterThan(0);
  });
});

describe("decrementTokens (atomik)", () => {
  // Helper membangun prisma mock dengan $transaction yang menjalankan callback
  // memakai tx mock yang diberikan.
  function buildPrismaMock(opts: {
    updateCount: number;
    remainingAfter: bigint;
  }) {
    const updateMany = vi.fn().mockResolvedValue({ count: opts.updateCount });
    const update = vi.fn().mockResolvedValue({});
    const findUnique = vi
      .fn()
      .mockResolvedValue({ tokensRemaining: opts.remainingAfter });

    const tx = {
      subscription: { updateMany, update, findUnique },
    };
    const prisma = {
      $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
    } as unknown as PrismaClient;

    return { prisma, updateMany, update, findUnique };
  }

  it("mengurangi token saat kuota cukup", async () => {
    const { prisma, updateMany, update } = buildPrismaMock({
      updateCount: 1,
      remainingAfter: 880n,
    });

    const result = await decrementTokens(prisma, "sub-1", 120);

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(880n);
    // updateMany dipanggil dengan kondisi gte agar atomik.
    const call = updateMany.mock.calls[0]?.[0];
    expect(call.where.id).toBe("sub-1");
    expect(call.where.tokensRemaining).toEqual({ gte: 120n });
    expect(call.data.tokensRemaining).toEqual({ decrement: 120n });
    expect(update).not.toHaveBeenCalled();
  });

  it("set sisa 0 (tidak minus) saat kuota tidak cukup", async () => {
    const { prisma, update } = buildPrismaMock({
      updateCount: 0,
      remainingAfter: 0n,
    });

    const result = await decrementTokens(prisma, "sub-2", 999);

    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0n);
    // Saat tidak cukup, sisa di-set 0 lewat update.
    const call = update.mock.calls[0]?.[0];
    expect(call.where.id).toBe("sub-2");
    expect(call.data.tokensRemaining).toBe(0n);
  });

  it("tidak pernah mengirim nilai negatif ke updateMany", async () => {
    const { prisma, updateMany } = buildPrismaMock({
      updateCount: 1,
      remainingAfter: 100n,
    });

    await decrementTokens(prisma, "sub-3", -50);

    const call = updateMany.mock.calls[0]?.[0];
    // used negatif dibulatkan ke 0.
    expect(call.data.tokensRemaining).toEqual({ decrement: 0n });
  });
});
