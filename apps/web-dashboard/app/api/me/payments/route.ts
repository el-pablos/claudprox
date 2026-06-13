import { NextResponse, type NextRequest } from "next/server";
import { readSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = readSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "unauthenticated" } }, { status: 401 });
  }
  const rows = await prisma.payment.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { plan: { select: { name: true } } },
  });
  const payments = rows.map((p) => ({
    id: p.id,
    planName: p.plan.name,
    amountIdr: p.amountIdr,
    method: p.method,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    confirmedAt: p.confirmedAt ? p.confirmedAt.toISOString() : null,
    note: p.note,
  }));
  return NextResponse.json({ payments });
}

interface CreateBody {
  planName?: unknown;
  method?: unknown;
}

export async function POST(req: NextRequest) {
  const session = readSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "unauthenticated" } }, { status: 401 });
  }
  const raw = (await req.json().catch(() => ({}))) as CreateBody;
  const planName = typeof raw.planName === "string" ? raw.planName : "";
  const method = typeof raw.method === "string" ? raw.method : "MANUAL_TRANSFER";

  if (!["MANUAL_TRANSFER", "QRIS", "EWALLET"].includes(method)) {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Metode pembayaran tidak dikenal" } },
      { status: 400 },
    );
  }

  const plan = await prisma.plan.findUnique({ where: { name: planName } });
  if (plan === null || !plan.isActive) {
    return NextResponse.json(
      { error: { type: "bad_request", message: "Paket tidak ditemukan" } },
      { status: 400 },
    );
  }

  const payment = await prisma.payment.create({
    data: {
      userId: session.sub,
      planId: plan.id,
      amountIdr: plan.priceIdr,
      method: method as "MANUAL_TRANSFER" | "QRIS" | "EWALLET",
      status: "PENDING",
    },
  });

  return NextResponse.json({ id: payment.id, status: payment.status });
}
