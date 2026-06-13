// JWT untuk sesi web (user & admin). Access token pendek + refresh token.
// RBAC: payload menyimpan role agar endpoint admin bisa cek di server.

import jwt from "jsonwebtoken";
import type { Role } from "@claudprox/shared";

/** Payload yang ditandatangani pada access/refresh token. */
export interface SessionPayload {
  sub: string;
  email: string;
  role: Role;
}

/** Masa berlaku access token (15 menit). */
const ACCESS_TTL = "15m";
/** Masa berlaku refresh token (7 hari). */
const REFRESH_TTL = "7d";

/** Tanda tangani access token. */
export function signAccessToken(payload: SessionPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: ACCESS_TTL });
}

/** Tanda tangani refresh token. */
export function signRefreshToken(payload: SessionPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: REFRESH_TTL });
}

/**
 * Verifikasi token dan kembalikan payload.
 * @returns SessionPayload bila valid; null bila invalid/kedaluwarsa.
 */
export function verifyToken(token: string, secret: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }
    const { sub, email, role } = decoded as Record<string, unknown>;
    if (typeof sub !== "string" || typeof email !== "string") {
      return null;
    }
    if (role !== "USER" && role !== "ADMIN") {
      return null;
    }
    return { sub, email, role };
  } catch {
    // Token invalid atau kedaluwarsa: perlakukan sebagai sesi tidak valid.
    return null;
  }
}

/** Cek apakah payload memiliki peran admin. */
export function isAdmin(payload: SessionPayload): boolean {
  return payload.role === "ADMIN";
}
