import { NextResponse } from "next/server";
import { confirmPayment } from "@claudprox/server";
import { readAdminSession } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = readAdminSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "forbidden" } }, { status: 403 });
  }
  const result = await confirmPayment(prisma, params.id, session.sub);
  if (!result.applied) {
    return NextResponse.json(
      { error: { type: "bad_state", message: result.reason ?? "tidak bisa di-approve" } },
      { status: 409 },
    );
  }
  return NextResponse.json(result);
}
