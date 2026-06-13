/**
 * Konstanta domain bersama ClaudProx.
 */

/** Prefix model upstream pada proxy.tams.codes. */
export const UPSTREAM_MODEL_PREFIX = "kr/";

/** Jumlah model yang diekspos gateway (whitelist kr/). */
export const EXPOSED_MODEL_COUNT = 52;

/** Timeout default request ke upstream dalam milidetik (300 detik). */
export const UPSTREAM_TIMEOUT_MS = 300_000;

/** Pemilik model default pada respons GET /v1/models versi user. */
export const MODEL_OWNED_BY = "claudprox";

/** Definisi paket langganan (selaras dengan ENGINEERING.md dan prisma/seed.ts). */
export const PLAN_DEFINITIONS = [
  {
    name: "Starter",
    tokens: 20_000_000,
    durationDays: 3,
    priceIdr: 30_000,
    rateLimitRpm: 60,
  },
  {
    name: "Pro",
    tokens: 100_000_000,
    durationDays: 6,
    priceIdr: 50_000,
    rateLimitRpm: 120,
  },
  {
    name: "Ultra",
    tokens: 300_000_000,
    durationDays: 14,
    priceIdr: 120_000,
    rateLimitRpm: 240,
  },
] as const;
