// Test rateLimit: lewat batas -> 429, dalam batas -> lolos.

import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, clearRateLimitState } from "../middleware/rateLimit.js";

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

function buildRequest(subscriptionId: string, rateLimitRpm: number) {
  return {
    subscription: { id: subscriptionId, plan: { rateLimitRpm } },
  } as any;
}

describe("rateLimit", () => {
  beforeEach(() => {
    clearRateLimitState();
  });

  it("melolosi request selama di bawah batas rpm", async () => {
    const limit = 3;
    for (let i = 0; i < limit; i += 1) {
      const { reply, state } = buildReply();
      await rateLimit(buildRequest("sub-1", limit), reply as any);
      expect(state.statusCode).toBeNull();
    }
  });

  it("menolak dengan 429 saat melewati batas rpm", async () => {
    const limit = 2;
    const request = buildRequest("sub-2", limit);

    // Dua request pertama lolos.
    await rateLimit(request, buildReply().reply as any);
    await rateLimit(request, buildReply().reply as any);

    // Request ketiga melebihi batas.
    const { reply, state } = buildReply();
    await rateLimit(request, reply as any);

    expect(state.statusCode).toBe(429);
    expect((state.payload as any).error.type).toBe("rate_limited");
  });

  it("menghitung batas terpisah per subscription", async () => {
    const limit = 1;
    // sub-A habis kuota.
    await rateLimit(buildRequest("sub-A", limit), buildReply().reply as any);
    const blockedA = buildReply();
    await rateLimit(buildRequest("sub-A", limit), blockedA.reply as any);
    expect(blockedA.state.statusCode).toBe(429);

    // sub-B masih punya kuota sendiri.
    const okB = buildReply();
    await rateLimit(buildRequest("sub-B", limit), okB.reply as any);
    expect(okB.state.statusCode).toBeNull();
  });
});
