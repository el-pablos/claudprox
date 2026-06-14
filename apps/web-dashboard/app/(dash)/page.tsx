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
  const tokensUsed = Math.max(0, tokensTotal - tokensRemaining);
  const expiresAt = activeSub?.expiresAt ?? null;
  const daysLeft = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const requestCount = totals._count._all ?? 0;
  const tokenSum = Number(totals._sum.totalTokens ?? 0);
  const promptSum = Number(totals._sum.promptTokens ?? 0);
  const completionSum = Number(totals._sum.completionTokens ?? 0);
  const usagePct = tokensTotal > 0 ? Math.round((tokensUsed / tokensTotal) * 100) : 0;

  const hasData = recent.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Ringkasan saldo token, masa aktif, dan aktivitas request kamu.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Token sisa"
          value={tokensRemaining.toLocaleString("id-ID")}
          sub={tokensTotal > 0 ? `dari ${tokensTotal.toLocaleString("id-ID")}` : "belum ada paket"}
          accent={tokensRemaining > 0 ? "primary" : "muted"}
          progress={tokensTotal > 0 ? 100 - usagePct : null}
        />
        <StatCard
          label="Token terpakai"
          value={tokensUsed.toLocaleString("id-ID")}
          sub={tokensTotal > 0 ? `${usagePct}% dari kuota` : "—"}
          accent="secondary"
        />
        <StatCard
          label="Hari sisa"
          value={String(daysLeft)}
          sub={expiresAt ? `berakhir ${expiresAt.toLocaleDateString("id-ID")}` : "—"}
          accent={daysLeft > 0 ? "primary" : "muted"}
        />
        <StatCard
          label="Total request"
          value={requestCount.toLocaleString("id-ID")}
          sub={`${tokenSum.toLocaleString("id-ID")} token diproses`}
          accent="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PlanCard
          planName={activeSub?.plan.name ?? null}
          rpm={activeSub?.plan.rateLimitRpm ?? null}
          expiresAt={expiresAt}
        />
        <div className="lg:col-span-2">
          <TokenSplitCard promptSum={promptSum} completionSum={completionSum} />
        </div>
      </div>

      {hasData ? (
        <>
          <UsageChart entries={recent} />
          <RecentRequests entries={recent} />
        </>
      ) : (
        <OnboardingEmptyState hasActivePlan={activeSub !== null} />
      )}
    </div>
  );
}

type RecentEntry = {
  id: string;
  model: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimated: boolean;
  createdAt: Date;
};

function StatCard({
  label,
  value,
  sub,
  accent,
  progress = null,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "primary" | "secondary" | "neutral" | "muted";
  progress?: number | null;
}) {
  const valueClass =
    accent === "primary"
      ? "text-primary"
      : accent === "secondary"
        ? "text-secondary"
        : accent === "muted"
          ? "text-foreground-muted"
          : "text-foreground";
  const barClass = accent === "secondary" ? "bg-secondary" : "bg-primary";
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-elev-1">
      <div className="text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</div>
      <div className={`mt-2 font-mono text-2xl tabular-nums ${valueClass}`}>{value}</div>
      <div className="mt-1 text-xs text-foreground-muted">{sub}</div>
      {progress !== null ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-skeleton">
          <div
            className={`h-full rounded-full ${barClass}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function PlanCard({
  planName,
  rpm,
  expiresAt,
}: {
  planName: string | null;
  rpm: number | null;
  expiresAt: Date | null;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-elev-1">
      <div className="text-xs font-medium uppercase tracking-wider text-foreground-muted">Paket aktif</div>
      {planName ? (
        <>
          <div className="mt-2 inline-flex w-fit items-center rounded-lg bg-primary/15 px-3 py-1 font-mono text-lg font-semibold text-primary">
            {planName}
          </div>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Rate limit</dt>
              <dd className="font-mono text-foreground">{rpm} RPM</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Berakhir</dt>
              <dd className="font-mono text-foreground">
                {expiresAt ? expiresAt.toLocaleDateString("id-ID") : "—"}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-foreground-muted">
            Belum ada paket aktif. Beli paket untuk mulai memakai gateway.
          </p>
          <a
            href="/buy"
            className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Beli paket
          </a>
        </>
      )}
    </div>
  );
}

function TokenSplitCard({ promptSum, completionSum }: { promptSum: number; completionSum: number }) {
  const total = promptSum + completionSum;
  const promptPct = total > 0 ? Math.round((promptSum / total) * 100) : 0;
  const completionPct = total > 0 ? 100 - promptPct : 0;
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-elev-1">
      <div className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
        Distribusi token (input vs output)
      </div>
      {total > 0 ? (
        <>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-skeleton">
            <div className="h-full bg-primary" style={{ width: `${promptPct}%` }} />
            <div className="h-full bg-secondary" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                <span className="text-foreground-muted">Input (prompt)</span>
              </div>
              <div className="mt-1 font-mono tabular-nums text-foreground">
                {promptSum.toLocaleString("id-ID")} <span className="text-foreground-muted">({promptPct}%)</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" aria-hidden="true" />
                <span className="text-foreground-muted">Output (completion)</span>
              </div>
              <div className="mt-1 font-mono tabular-nums text-foreground">
                {completionSum.toLocaleString("id-ID")} <span className="text-foreground-muted">({completionPct}%)</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-foreground-muted">
          Belum ada token terpakai. Data input/output muncul setelah request pertama.
        </p>
      )}
    </div>
  );
}

function UsageChart({ entries }: { entries: RecentEntry[] }) {
  const chronological = [...entries].reverse();
  const maxToken = Math.max(...chronological.map((e) => e.totalTokens), 1);
  const totalShown = chronological.reduce((acc, e) => acc + e.totalTokens, 0);

  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-elev-1">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Token per request terakhir</h2>
        <span className="font-mono text-xs text-foreground-muted">
          {chronological.length} request · {totalShown.toLocaleString("id-ID")} token
        </span>
      </div>
      <div className="mt-5 flex h-40 items-end gap-2" role="img" aria-label="Grafik batang token per request terakhir">
        {chronological.map((e) => {
          const heightPct = Math.max(4, Math.round((e.totalTokens / maxToken) * 100));
          return (
            <div key={e.id} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-secondary to-primary transition-opacity hover:opacity-80"
                style={{ height: `${heightPct}%` }}
                title={`${e.model}: ${e.totalTokens.toLocaleString("id-ID")} token`}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-foreground-muted">
        Batang tertinggi = {maxToken.toLocaleString("id-ID")} token. Urut dari request terlama ke terbaru.
      </p>
    </section>
  );
}

function RecentRequests({ entries }: { entries: RecentEntry[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-foreground">Riwayat request terakhir</h2>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background-elevated text-left text-xs uppercase tracking-wider text-foreground-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5">Waktu</th>
              <th scope="col" className="px-4 py-2.5">Model</th>
              <th scope="col" className="px-4 py-2.5 text-right">Prompt</th>
              <th scope="col" className="px-4 py-2.5 text-right">Completion</th>
              <th scope="col" className="px-4 py-2.5 text-right">Total</th>
              <th scope="col" className="px-4 py-2.5">Catatan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((r) => (
              <tr key={r.id} className="hover:bg-surface-hover">
                <td className="px-4 py-2.5 text-foreground-muted">{r.createdAt.toLocaleString("id-ID")}</td>
                <td className="px-4 py-2.5 font-mono text-foreground">{r.model}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground-muted">{r.promptTokens.toLocaleString("id-ID")}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-foreground-muted">{r.completionTokens.toLocaleString("id-ID")}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-primary">{r.totalTokens.toLocaleString("id-ID")}</td>
                <td className="px-4 py-2.5">
                  <EstimateBadge estimated={r.estimated} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {entries.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <code className="break-all font-mono text-sm text-foreground">{r.model}</code>
              <EstimateBadge estimated={r.estimated} />
            </div>
            <div className="mt-2 text-xs text-foreground-muted">{r.createdAt.toLocaleString("id-ID")}</div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <Metric label="Prompt" value={r.promptTokens} />
              <Metric label="Completion" value={r.completionTokens} />
              <Metric label="Total" value={r.totalTokens} highlight />
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <dt className="uppercase tracking-wider text-foreground-muted">{label}</dt>
      <dd className={`mt-0.5 font-mono tabular-nums ${highlight ? "text-primary" : "text-foreground"}`}>
        {value.toLocaleString("id-ID")}
      </dd>
    </div>
  );
}

function EstimateBadge({ estimated }: { estimated: boolean }) {
  const cls = estimated
    ? "border-warning/40 text-warning"
    : "border-success/40 text-success";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {estimated ? "estimasi" : "akurat"}
    </span>
  );
}

function OnboardingEmptyState({ hasActivePlan }: { hasActivePlan: boolean }) {
  const steps = [
    { title: "Beli atau aktifkan paket", done: hasActivePlan, href: "/buy", cta: "Beli paket" },
    { title: "Buat API key", done: false, href: "/keys", cta: "Buat key" },
    { title: "Salin base URL gateway", done: false, href: "/keys", cta: "Lihat base URL" },
    { title: "Jalankan request pertama dari CLI/tool kamu", done: false, href: null, cta: null },
    { title: "Pantau pemakaian di halaman ini", done: false, href: null, cta: null },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-elev-1 sm:p-8">
      <h2 className="text-lg font-semibold text-foreground">Mulai pakai ClaudProx</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Belum ada request tercatat. Ikuti langkah berikut untuk request pertama kamu.
      </p>
      <ol className="mt-6 space-y-3">
        {steps.map((step, idx) => (
          <li
            key={step.title}
            className="flex items-center gap-4 rounded-lg border border-border bg-background-elevated p-4"
          >
            <span
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold",
                step.done
                  ? "bg-success/20 text-success"
                  : "bg-primary/15 text-primary",
              ].join(" ")}
              aria-hidden="true"
            >
              {step.done ? "✓" : idx + 1}
            </span>
            <span className="flex-1 text-sm text-foreground">{step.title}</span>
            {step.href && step.cta ? (
              <a
                href={step.href}
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {step.cta}
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
