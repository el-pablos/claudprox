import { prisma } from "../../../lib/prisma";
import { UsersTable, type UserRow } from "../../../components/UsersTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      subscriptions: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { plan: { select: { name: true } } },
      },
      _count: { select: { usageLogs: true, apiKeys: true } },
    },
  });

  const rows: UserRow[] = users.map((u) => {
    const sub = u.subscriptions[0];
    return {
      id: u.id,
      email: u.email,
      role: u.role === "ADMIN" ? "ADMIN" : "USER",
      createdAt: u.createdAt.toISOString(),
      planName: sub?.plan.name ?? null,
      tokensRemaining: sub ? sub.tokensRemaining.toString() : null,
      expiresAt: sub ? sub.expiresAt.toISOString() : null,
      requestCount: u._count.usageLogs,
      keyCount: u._count.apiKeys,
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Daftar user
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          100 user terbaru. Cari, filter, dan urutkan secara langsung.
        </p>
      </header>

      <UsersTable users={rows} />
    </div>
  );
}
