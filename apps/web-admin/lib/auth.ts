// Helper sesi admin untuk web-admin.
// Cookie terpisah dari dashboard user (cpx_admin_session) supaya isolasi role bersih.

import { cookies } from "next/headers";
import { verifyToken, signAccessToken, type SessionPayload } from "@claudprox/server";

const COOKIE_NAME = "cpx_admin_session";

function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s === undefined || s === "") {
    throw new Error("JWT_SECRET tidak diset di environment");
  }
  return s;
}

export function readAdminSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token === undefined || token === "") return null;
  const payload = verifyToken(token, jwtSecret());
  if (payload === null) return null;
  if (payload.role !== "ADMIN") return null;
  return payload;
}

export function requireAdmin(): SessionPayload {
  const s = readAdminSession();
  if (s === null) {
    throw new Error("admin session tidak valid");
  }
  return s;
}

export function setAdminCookie(payload: SessionPayload): void {
  const token = signAccessToken(payload, jwtSecret());
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  });
}

export function clearAdminCookie(): void {
  cookies().delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
