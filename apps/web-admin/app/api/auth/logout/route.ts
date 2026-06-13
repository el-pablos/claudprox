import { NextResponse } from "next/server";
import { clearAdminCookie } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST() {
  clearAdminCookie();
  return NextResponse.redirect(
    new URL("/login", process.env.DASHBOARD_ADMIN_URL ?? "http://localhost:4018"),
  );
}
