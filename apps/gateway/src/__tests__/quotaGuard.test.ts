// Test quotaGuard: 402 (token habis), 403 (expired/tak ada), dan lolos.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createQuotaGuard } from "../middleware/quotaGuard.js";
import type { PrismaClient } from "@prisma/client";

// Reply mock yang merekam kode status dan payload.
function buildReply() {
  const state: { statusCode: number | null; payload: unknown } = {
    statusCode: null,
    payload: null,
  };
  const reply = {
    code(status: number) {
      state.statusCode = status;
      return this;
    },
    async send(payload: unknown) {
      state.payload = payload;
      return this;
    },
  };
  return { reply, state };
}

function buildRequest(userId: string) {
  return {
    apiKeyCtx: { apiKeyId: "key-1", userId, user: { id: userId } },
  } as any;
}

function buildPrisma(subscription: unknown): PrismaClient {
  return {
    subscription: {
      findFirst: vi.fn().mockResolvedValue(subscription),
    },
  } as unknown as PrismaClient;
}

describe("quotaGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("403 subscription_expired bila tidak ada langganan aktif", async () => {
    const guard = createQuotaGuard(buildPrisma(null));
    const { reply, state } = buildReply();

    await guard(buildRequest("user-1"), reply as any);

    expect(state.statusCode).toBe(403);
    expect((state.payload as any).error.type).toBe("subscription_expired");
  });

  it("403 subscription_expired bila expiresAt sudah lewat", async () => {
    const expired = {
      id: "sub-1",
      expiresAt: new Date(Date.now() - 1000),
      tokensRemaining: 100n,
      plan: { rateLimitRpm: 60 },
    };
    const guard = createQuotaGuard(buildPrisma(expired));
    const { reply, state } = buildReply();

    await guard(buildRequest("user-1"), reply as any);

    expect(state.statusCode).toBe(403);
    expect((state.payload as any).error.type).toBe("subscription_expired");
  });

  it("402 insufficient_tokens bila tokensRemaining <= 0", async () => {
    const empty = {
      id: "sub-1",
      expiresAt: new Date(Date.now() + 60_000),
      tokensRemaining: 0n,
      plan: { rateLimitRpm: 60 },
    };
    const guard = createQuotaGuard(buildPrisma(empty));
    const { reply, state } = buildReply();

    await guard(buildRequest("user-1"), reply as any);

    expect(state.statusCode).toBe(402);
    expect((state.payload as any).error.type).toBe("insufficient_tokens");
  });

  it("lolos dan menetapkan request.subscription saat valid", async () => {
    const valid = {
      id: "sub-1",
      expiresAt: new Date(Date.now() + 60_000),
      tokensRemaining: 5000n,
      plan: { rateLimitRpm: 60 },
    };
    const guard = createQuotaGuard(buildPrisma(valid));
    const { reply, state } = buildReply();
    const request = buildRequest("user-1");

    await guard(request, reply as any);

    // Tidak ada respons error.
    expect(state.statusCode).toBeNull();
    expect(request.subscription).toEqual(valid);
  });
});
