import { NextResponse } from "next/server";
import { readSession } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = readSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "unauthenticated" } }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (user === null) {
    return NextResponse.json({ error: { type: "user_not_found" } }, { status: 404 });
  }
  return NextResponse.json({ user });
}
