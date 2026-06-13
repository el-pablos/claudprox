import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { readAdminSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (readAdminSession() === null) {
    return NextResponse.json({ error: { type: "forbidden" } }, { status: 403 });
  }
  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const where: Prisma.PaymentWhereInput =
    statusParam === "PENDING" || statusParam === "CONFIRMED" || statusParam === "REJECTED"
      ? { status: statusParam }
      : {};

  const rows = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { email: true } },
      plan: { select: { name: true } },
    },
  });

  const payments = rows.map((p) => ({
    id: p.id,
    email: p.user.email,
    planName: p.plan.name,
    amountIdr: p.amountIdr,
    method: p.method,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    note: p.note,
  }));

  return NextResponse.json({ payments });
}
