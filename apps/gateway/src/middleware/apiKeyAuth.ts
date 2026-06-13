// Middleware autentikasi API key.
// Key diambil dari header Authorization: Bearer <key> atau x-api-key.
// Hash sha256(key + APIKEY_HASH_SECRET) dicocokkan dengan ApiKey.keyHash.
// Hasil lookup di-cache in-memory selama 30 detik untuk mengurangi query.

import { createHash } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { PrismaClient, User } from "@prisma/client";
import type { ApiKeyContext } from "../types/fastify.js";

const CACHE_TTL_MS = 30_000;

interface CacheEntry {
  ctx: ApiKeyContext;
  expiresAt: number;
}

// Cache modul-level: keyHash -> konteks. TTL pendek agar perubahan status
// key (mis. dinonaktifkan) cepat terlihat tanpa membebani database.
const cache = new Map<string, CacheEntry>();

/** Ambil API key mentah dari header request. */
function extractApiKey(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader !== undefined && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token !== "") {
      return token;
    }
  }

  const headerKey = request.headers["x-api-key"];
  if (typeof headerKey === "string" && headerKey.trim() !== "") {
    return headerKey.trim();
  }

  return null;
}

/** Hitung hash key memakai secret dari env. */
export function hashApiKey(key: string, secret: string): string {
  return createHash("sha256").update(`${key}${secret}`).digest("hex");
}

function getHashSecret(): string {
  const secret = process.env.APIKEY_HASH_SECRET;
  if (secret === undefined || secret === "") {
    throw new Error("APIKEY_HASH_SECRET belum diset");
  }
  return secret;
}

/**
 * Bangun preHandler autentikasi API key dengan PrismaClient yang di-inject.
 * Memisahkan dependency prisma membuat fungsi ini mudah diuji.
 */
export function createApiKeyAuth(prisma: PrismaClient) {
  return async function apiKeyAuth(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const rawKey = extractApiKey(request);
    if (rawKey === null) {
      await reply.code(401).send({
        error: { type: "invalid_api_key", message: "API key tidak ditemukan" },
      });
      return;
    }

    const keyHash = hashApiKey(rawKey, getHashSecret());

    const cached = cache.get(keyHash);
    if (cached !== undefined && cached.expiresAt > Date.now()) {
      request.apiKeyCtx = cached.ctx;
      return;
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: { keyHash, isActive: true },
      include: { user: true },
    });

    if (apiKey === null) {
      cache.delete(keyHash);
      await reply.code(401).send({
        error: { type: "invalid_api_key", message: "API key tidak valid" },
      });
      return;
    }

    const ctx: ApiKeyContext = {
      apiKeyId: apiKey.id,
      userId: apiKey.userId,
      user: apiKey.user as User,
    };
    cache.set(keyHash, { ctx, expiresAt: Date.now() + CACHE_TTL_MS });
    request.apiKeyCtx = ctx;
  };
}

/** Kosongkan cache (dipakai pada pengujian). */
export function clearApiKeyCache(): void {
  cache.clear();
}
