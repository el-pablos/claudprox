import { prisma } from "../../../lib/prisma";

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">Daftar user</h1>
        <p className="mt-1 text-sm text-slate-400">100 user terbaru.</p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-ctos-border">
        <table className="min-w-full divide-y divide-ctos-border text-sm">
          <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Paket aktif</th>
              <th className="px-4 py-2 text-right">Token sisa</th>
              <th className="px-4 py-2">Berakhir</th>
              <th className="px-4 py-2 text-right">Request</th>
              <th className="px-4 py-2 text-right">Key</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
            {users.map((u) => {
              const sub = u.subscriptions[0];
              return (
                <tr key={u.id}>
                  <td className="px-4 py-2 text-slate-200">{u.email}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    <span className={u.role === "ADMIN" ? "text-red-400" : "text-slate-400"}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-300">{sub?.plan.name ?? "—"}</td>
                  <td className="px-4 py-2 text-right font-mono text-ctos-accent">
                    {sub ? Number(sub.tokensRemaining).toLocaleString("id-ID") : "—"}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {sub ? sub.expiresAt.toLocaleDateString("id-ID") : "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300">{u._count.usageLogs}</td>
                  <td className="px-4 py-2 text-right text-slate-300">{u._count.apiKeys}</td>
                  <td className="px-4 py-2 text-right">
                    <a
                      href={`/users/${u.id}`}
                      className="text-xs text-ctos-accent hover:underline"
                    >
                      Detail →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
