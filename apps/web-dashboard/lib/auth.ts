// Helper sesi user untuk web-dashboard.
// Cookie httpOnly + sameSite=lax. Verify via packages/server.

import { cookies } from "next/headers";
import { verifyToken, signAccessToken, type SessionPayload } from "@claudprox/server";

const COOKIE_NAME = "cpx_session";

function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s === undefined || s === "") {
    throw new Error("JWT_SECRET tidak diset di environment");
  }
  return s;
}

export function readSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (token === undefined || token === "") return null;
  return verifyToken(token, jwtSecret());
}

export function requireSession(): SessionPayload {
  const s = readSession();
  if (s === null) {
    throw new Error("session tidak valid");
  }
  return s;
}

export function setSessionCookie(payload: SessionPayload): void {
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

export function clearSessionCookie(): void {
  cookies().delete(COOKIE_NAME);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
