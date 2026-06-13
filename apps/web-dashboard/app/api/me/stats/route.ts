import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = readSession();
  if (session === null) {
    return NextResponse.json({ error: { type: "unauthenticated" } }, { status: 401 });
  }
  const userId = session.sub;

  const [activeSub, totals] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { plan: { select: { name: true, rateLimitRpm: true } } },
    }),
    prisma.usageLog.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { totalTokens: true },
    }),
  ]);

  return NextResponse.json({
    subscription: activeSub
      ? {
          planName: activeSub.plan.name,
          rateLimitRpm: activeSub.plan.rateLimitRpm,
          tokensRemaining: activeSub.tokensRemaining.toString(),
          tokensTotal: activeSub.tokensTotal.toString(),
          expiresAt: activeSub.expiresAt.toISOString(),
        }
      : null,
    totals: {
      requestCount: totals._count._all,
      tokenSum: totals._sum.totalTokens ?? 0,
    },
  });
}
