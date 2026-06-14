import { NextResponse, type NextRequest } from "next/server";
import { hashPassword } from "@claudprox/server";
import { prisma } from "../../../../lib/prisma";
import { setSessionCookie } from "../../../../lib/auth";

export const runtime = "nodejs";

interface SignupBody {
  email?: unknown;
  password?: unknown;
  name?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const raw = (await req.json().catch(() => ({}))) as SignupBody;
  const email = typeof raw.email === "string" ? raw.email.toLowerCase().trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";

  if (email === "" || password === "" || name === "") {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Nama, email, dan kata sandi wajib diisi" } },
      { status: 400 },
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Format email tidak valid" } },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Kata sandi minimal 8 karakter" } },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing !== null) {
    return NextResponse.json(
      { error: { type: "email_taken", message: "Email sudah terdaftar. Silakan masuk." } },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, role: "USER" },
  });

  setSessionCookie({ sub: user.id, email: user.email, role: "USER" });
  return NextResponse.json({ ok: true });
}
