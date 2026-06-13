import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [userCount, requestCount, tokenAgg, revenueAgg, activeSubs] = await Promise.all([
    prisma.user.count(),
    prisma.usageLog.count(),
    prisma.usageLog.aggregate({ _sum: { totalTokens: true } }),
    prisma.payment.aggregate({
      _sum: { amountIdr: true },
      where: { status: "CONFIRMED" },
    }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
  ]);

  const tokenSum = tokenAgg._sum.totalTokens ?? 0;
  const revenue = revenueAgg._sum.amountIdr ?? 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">Overview admin</h1>
        <p className="mt-1 text-sm text-slate-400">Statistik global semua user.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total user" value={userCount.toLocaleString("id-ID")} />
        <Stat label="Langganan aktif" value={activeSubs.toLocaleString("id-ID")} />
        <Stat label="Total request" value={requestCount.toLocaleString("id-ID")} />
        <Stat label="Total token terpakai" value={tokenSum.toLocaleString("id-ID")} />
        <Stat
          label="Pendapatan terkonfirmasi"
          value={`Rp${revenue.toLocaleString("id-ID")}`}
          tone="ok"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "ok";
}) {
  const cls = tone === "ok" ? "text-emerald-400" : "text-slate-100";
  return (
    <div className="rounded-lg border border-ctos-border bg-ctos-panel p-5">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-2 font-mono text-2xl ${cls}`}>{value}</div>
    </div>
  );
}
