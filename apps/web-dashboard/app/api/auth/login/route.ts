import { NextResponse, type NextRequest } from "next/server";
import { verifyPassword } from "@claudprox/server";
import { prisma } from "../../../../lib/prisma";
import { setSessionCookie } from "../../../../lib/auth";

export const runtime = "nodejs";

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export async function POST(req: NextRequest) {
  const raw = (await req.json().catch(() => ({}))) as LoginBody;
  const email = typeof raw.email === "string" ? raw.email.toLowerCase().trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";

  if (email === "" || password === "") {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Email dan kata sandi wajib diisi" } },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user === null) {
    return NextResponse.json(
      { error: { type: "invalid_credentials", message: "Email atau kata sandi salah" } },
      { status: 401 },
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: { type: "invalid_credentials", message: "Email atau kata sandi salah" } },
      { status: 401 },
    );
  }

  if (user.role !== "USER") {
    // Admin login lewat web-admin terpisah.
    return NextResponse.json(
      { error: { type: "wrong_portal", message: "Akun admin login lewat dashboard admin" } },
      { status: 403 },
    );
  }

  setSessionCookie({ sub: user.id, email: user.email, role: "USER" });

  return NextResponse.json({ ok: true });
}
