// Test apiKeyAuth: 401 invalid, lolos valid, hash benar.

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createApiKeyAuth,
  hashApiKey,
  clearApiKeyCache,
} from "../middleware/apiKeyAuth.js";
import type { PrismaClient } from "@prisma/client";

const SECRET = "rahasia-uji";

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

function buildRequest(headers: Record<string, string>) {
  return { headers } as any;
}

describe("hashApiKey", () => {
  it("menghasilkan sha256 hex deterministik", () => {
    const h1 = hashApiKey("kunci-abc", SECRET);
    const h2 = hashApiKey("kunci-abc", SECRET);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hash berbeda untuk key berbeda", () => {
    expect(hashApiKey("kunci-a", SECRET)).not.toBe(hashApiKey("kunci-b", SECRET));
  });

  it("hash berbeda untuk secret berbeda", () => {
    expect(hashApiKey("kunci-a", "secret-1")).not.toBe(hashApiKey("kunci-a", "secret-2"));
  });
});

describe("apiKeyAuth", () => {
  beforeEach(() => {
    clearApiKeyCache();
    vi.clearAllMocks();
    process.env.APIKEY_HASH_SECRET = SECRET;
  });

  it("401 invalid_api_key bila tidak ada key di header", async () => {
    const prisma = { apiKey: { findFirst: vi.fn() } } as unknown as PrismaClient;
    const auth = createApiKeyAuth(prisma);
    const { reply, state } = buildReply();

    await auth(buildRequest({}), reply as any);

    expect(state.statusCode).toBe(401);
    expect((state.payload as any).error.type).toBe("invalid_api_key");
  });

  it("401 invalid_api_key bila key tidak ditemukan di database", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const prisma = { apiKey: { findFirst } } as unknown as PrismaClient;
    const auth = createApiKeyAuth(prisma);
    const { reply, state } = buildReply();

    await auth(buildRequest({ authorization: "Bearer kunci-salah" }), reply as any);

    expect(state.statusCode).toBe(401);
    expect((state.payload as any).error.type).toBe("invalid_api_key");
    // Hash yang dicari harus sesuai sha256(key+secret).
    const call = findFirst.mock.calls[0]?.[0];
    expect(call.where.keyHash).toBe(hashApiKey("kunci-salah", SECRET));
    expect(call.where.isActive).toBe(true);
  });

  it("lolos dan set apiKeyCtx untuk key valid (Authorization Bearer)", async () => {
    const apiKey = {
      id: "key-1",
      userId: "user-1",
      user: { id: "user-1", email: "a@b.c" },
    };
    const findFirst = vi.fn().mockResolvedValue(apiKey);
    const prisma = { apiKey: { findFirst } } as unknown as PrismaClient;
    const auth = createApiKeyAuth(prisma);
    const { reply, state } = buildReply();
    const request = buildRequest({ authorization: "Bearer kunci-benar" });

    await auth(request, reply as any);

    expect(state.statusCode).toBeNull();
    expect(request.apiKeyCtx).toEqual({
      apiKeyId: "key-1",
      userId: "user-1",
      user: apiKey.user,
    });
  });

  it("menerima key dari header x-api-key", async () => {
    const apiKey = { id: "key-2", userId: "user-2", user: { id: "user-2" } };
    const findFirst = vi.fn().mockResolvedValue(apiKey);
    const prisma = { apiKey: { findFirst } } as unknown as PrismaClient;
    const auth = createApiKeyAuth(prisma);
    const { reply, state } = buildReply();
    const request = buildRequest({ "x-api-key": "kunci-header" });

    await auth(request, reply as any);

    expect(state.statusCode).toBeNull();
    expect(request.apiKeyCtx?.apiKeyId).toBe("key-2");
    const call = findFirst.mock.calls[0]?.[0];
    expect(call.where.keyHash).toBe(hashApiKey("kunci-header", SECRET));
  });

  it("memakai cache pada panggilan kedua dengan key sama (tidak query ulang)", async () => {
    const apiKey = { id: "key-3", userId: "user-3", user: { id: "user-3" } };
    const findFirst = vi.fn().mockResolvedValue(apiKey);
    const prisma = { apiKey: { findFirst } } as unknown as PrismaClient;
    const auth = createApiKeyAuth(prisma);

    const r1 = buildRequest({ authorization: "Bearer kunci-cache" });
    const r2 = buildRequest({ authorization: "Bearer kunci-cache" });
    await auth(r1, buildReply().reply as any);
    await auth(r2, buildReply().reply as any);

    // findFirst hanya dipanggil sekali karena hit cache.
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(r2.apiKeyCtx?.apiKeyId).toBe("key-3");
  });
});
