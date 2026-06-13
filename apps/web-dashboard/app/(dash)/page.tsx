import { readSession } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = readSession();
  if (session === null) return null;

  const userId = session.sub;

  const [activeSub, totals, recent] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    }),
    prisma.usageLog.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true },
    }),
    prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        model: true,
        totalTokens: true,
        promptTokens: true,
        completionTokens: true,
        estimated: true,
        createdAt: true,
      },
    }),
  ]);

  const tokensRemaining = activeSub ? Number(activeSub.tokensRemaining) : 0;
  const tokensTotal = activeSub ? Number(activeSub.tokensTotal) : 0;
  const expiresAt = activeSub?.expiresAt ?? null;
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">Overview</h1>
        <p className="mt-1 text-sm text-slate-400">
          Ringkasan saldo token, hari sisa, dan request kamu.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Token sisa"
          value={tokensRemaining.toLocaleString("id-ID")}
          sub={tokensTotal > 0 ? `dari ${tokensTotal.toLocaleString("id-ID")}` : "belum ada langganan"}
          tone={tokensRemaining > 0 ? "ok" : "warn"}
        />
        <Stat
          label="Hari sisa"
          value={String(daysLeft)}
          sub={expiresAt ? expiresAt.toLocaleDateString("id-ID") : "—"}
          tone={daysLeft > 0 ? "ok" : "warn"}
        />
        <Stat
          label="Total request"
          value={(totals._count._all ?? 0).toLocaleString("id-ID")}
          sub={`token: ${(totals._sum.totalTokens ?? 0).toLocaleString("id-ID")}`}
        />
        <Stat
          label="Paket aktif"
          value={activeSub?.plan.name ?? "—"}
          sub={activeSub ? `${activeSub.plan.rateLimitRpm} RPM` : "beli paket dulu"}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Riwayat request terakhir</h2>
        {recent.length === 0 ? (
          <p className="rounded-md border border-ctos-border bg-ctos-panel p-6 text-sm text-slate-400">
            Belum ada request. Mulai pakai API key kamu di tab API Key.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ctos-border">
            <table className="min-w-full divide-y divide-ctos-border text-sm">
              <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-2">Waktu</th>
                  <th className="px-4 py-2">Model</th>
                  <th className="px-4 py-2 text-right">Prompt</th>
                  <th className="px-4 py-2 text-right">Completion</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-slate-400">
                      {r.createdAt.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-200">{r.model}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{r.promptTokens}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{r.completionTokens}</td>
                    <td className="px-4 py-2 text-right font-mono text-ctos-accent">
                      {r.totalTokens}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {r.estimated ? "estimasi" : "akurat"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const valueClass =
    tone === "ok" ? "text-ctos-accent" : tone === "warn" ? "text-ctos-warn" : "text-slate-100";
  return (
    <div className="rounded-lg border border-ctos-border bg-ctos-panel p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-2 font-mono text-2xl ${valueClass}`}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-500">{sub}</div> : null}
    </div>
  );
}
