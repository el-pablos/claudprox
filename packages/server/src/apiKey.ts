// Lifecycle API key gateway: generate, hash, dan format prefix untuk display.
//
// PENTING: hashApiKey HARUS identik dengan implementasi di
// apps/gateway/src/middleware/apiKeyAuth.ts agar key yang dibuat di web
// valid saat dipakai user menembak gateway. Algoritma: sha256(key + secret).

import { createHash, randomBytes } from "node:crypto";

/** Awalan tetap untuk semua API key ClaudProx. */
export const API_KEY_PREFIX = "cpx_live_";

/** Jumlah byte acak untuk bagian rahasia key (32 byte -> 64 char hex). */
const KEY_RANDOM_BYTES = 32;

/** Panjang potongan key yang ditampilkan sebagai prefix di dashboard. */
const DISPLAY_PREFIX_LENGTH = API_KEY_PREFIX.length + 8;

/** Hasil pembuatan API key baru. */
export interface GeneratedApiKey {
  /** Key plaintext lengkap. Hanya ditampilkan SEKALI ke user. */
  plaintext: string;
  /** Hash yang disimpan di DB (ApiKey.keyHash). */
  keyHash: string;
  /** Prefix untuk display (mis. cpx_live_ab12cd34). Aman disimpan/ditampilkan. */
  keyPrefix: string;
}

/**
 * Hitung hash API key memakai secret dari env.
 * WAJIB identik dengan gateway: sha256(key + secret) -> hex.
 */
export function hashApiKey(key: string, secret: string): string {
  return createHash("sha256").update(`${key}${secret}`).digest("hex");
}

/** Ambil prefix display dari key plaintext. */
export function deriveKeyPrefix(plaintext: string): string {
  return plaintext.slice(0, DISPLAY_PREFIX_LENGTH);
}

/**
 * Buat API key baru beserta hash dan prefix display.
 * @param secret APIKEY_HASH_SECRET dari env.
 */
export function generateApiKey(secret: string): GeneratedApiKey {
  if (secret === "") {
    throw new Error("secret untuk hashApiKey tidak boleh kosong");
  }
  const random = randomBytes(KEY_RANDOM_BYTES).toString("hex");
  const plaintext = `${API_KEY_PREFIX}${random}`;
  return {
    plaintext,
    keyHash: hashApiKey(plaintext, secret),
    keyPrefix: deriveKeyPrefix(plaintext),
  };
}
