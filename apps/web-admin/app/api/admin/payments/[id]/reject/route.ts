import { NextResponse, type NextRequest } from "next/server";
import { rejectPayment } from "@claudprox/server";
import { readAdminSession } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";

export const runtime = "nodejs";

interface RejectBody {
  reason?: unknown;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (readAdminSession() === null) {
    return NextResponse.json({ error: { type: "forbidden" } }, { status: 403 });
  }
  const raw = (await req.json().catch(() => ({}))) as RejectBody;
  const reason = typeof raw.reason === "string" ? raw.reason.trim() : "";
  if (reason === "") {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Alasan reject wajib diisi" } },
      { status: 400 },
    );
  }
  const result = await rejectPayment(prisma, params.id, reason);
  if (!result.applied) {
    return NextResponse.json(
      { error: { type: "bad_state", message: result.reason ?? "tidak bisa di-reject" } },
      { status: 409 },
    );
  }
  return NextResponse.json(result);
}
