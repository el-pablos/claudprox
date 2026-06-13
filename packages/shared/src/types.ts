/**
 * Tipe domain bersama untuk seluruh monorepo ClaudProx.
 * Diekspor lewat @claudprox/shared agar gateway, dashboard, dan billing
 * memakai kontrak yang sama.
 */

/** Peran pengguna pada sistem. Selaras dengan enum Role di Prisma. */
export type Role = "USER" | "ADMIN";

/** Status langganan. Selaras dengan enum SubStatus di Prisma. */
export type SubStatus = "ACTIVE" | "EXPIRED" | "SUSPENDED";

/** Metode pembayaran. Selaras dengan enum PaymentMethod di Prisma. */
export type PaymentMethod = "MANUAL_TRANSFER" | "QRIS" | "EWALLET";

/** Status pembayaran. Selaras dengan enum PaymentStatus di Prisma. */
export type PaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED";

/** Jenis kuota token pada subscription wallet. */
export interface TokenWallet {
  /** Sisa token yang masih bisa dipakai. */
  tokensRemaining: bigint;
  /** Total token yang pernah diberikan (untuk laporan pemakaian). */
  tokensTotal: bigint;
  /** Waktu kedaluwarsa langganan. */
  expiresAt: Date;
}

/**
 * Format error konsisten yang dikembalikan gateway.
 * Sesuai keputusan terkunci di ENGINEERING.md.
 */
export interface ApiErrorBody {
  error: {
    type: ApiErrorType;
    message: string;
  };
}

/** Daftar tipe error yang dikenal gateway beserta kode HTTP-nya. */
export type ApiErrorType =
  | "invalid_model"
  | "invalid_api_key"
  | "insufficient_tokens"
  | "subscription_expired"
  | "rate_limited"
  | "upstream_error"
  | "gateway_timeout"
  | "bad_request"
  | "internal_error";

/** Struktur usage OpenAI-compatible yang dikembalikan upstream. */
export interface UpstreamUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/** Entri model pada respons GET /v1/models versi user. */
export interface ModelListEntry {
  id: string;
  object: "model";
  owned_by: string;
}
