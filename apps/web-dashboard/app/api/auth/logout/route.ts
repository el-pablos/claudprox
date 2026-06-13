import { NextResponse } from "next/server";
import { clearSessionCookie } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST() {
  clearSessionCookie();
  return NextResponse.redirect(new URL("/login", process.env.DASHBOARD_USER_URL ?? "http://localhost:4017"));
}
