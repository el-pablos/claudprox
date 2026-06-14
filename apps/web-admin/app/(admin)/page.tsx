import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [userCount, requestCount, tokenAgg, revenueAgg, activeSubs, pendingPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.usageLog.count(),
      prisma.usageLog.aggregate({ _sum: { totalTokens: true } }),
      prisma.payment.aggregate({
        _sum: { amountIdr: true },
        where: { status: "CONFIRMED" },
      }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ]);

  const tokenSum = tokenAgg._sum.totalTokens ?? 0;
  const revenue = revenueAgg._sum.amountIdr ?? 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Overview admin
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Statistik operasional global semua user.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total user"
          value={userCount.toLocaleString("id-ID")}
          icon={<UsersIcon />}
        />
        <StatCard
          label="Langganan aktif"
          value={activeSubs.toLocaleString("id-ID")}
          icon={<SubsIcon />}
        />
        <StatCard
          label="Total request"
          value={requestCount.toLocaleString("id-ID")}
          icon={<RequestIcon />}
        />
        <StatCard
          label="Total token terpakai"
          value={tokenSum.toLocaleString("id-ID")}
          icon={<TokenIcon />}
        />
        <StatCard
          label="Pendapatan terkonfirmasi"
          value={`Rp${revenue.toLocaleString("id-ID")}`}
          icon={<RevenueIcon />}
          tone="success"
        />
        <StatCard
          label="Pembayaran pending"
          value={pendingPayments.toLocaleString("id-ID")}
          icon={<PendingIcon />}
          tone={pendingPayments > 0 ? "primary" : "neutral"}
          hint={pendingPayments > 0 ? "Butuh verifikasi" : "Tidak ada antrean"}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-muted">
          Aksi cepat
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickAction
            href="/payments"
            title="Verifikasi pembayaran"
            description={
              pendingPayments > 0
                ? `${pendingPayments.toLocaleString("id-ID")} pembayaran menunggu approve atau reject.`
                : "Tidak ada pembayaran pending saat ini."
            }
            badge={pendingPayments > 0 ? pendingPayments.toLocaleString("id-ID") : undefined}
            icon={<PaymentsIcon />}
          />
          <QuickAction
            href="/users"
            title="Kelola user"
            description={`Lihat dan cari ${userCount.toLocaleString("id-ID")} user terdaftar.`}
            icon={<ManageUsersIcon />}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "neutral" | "success" | "primary";
  hint?: string;
}) {
  const valueCls =
    tone === "success"
      ? "text-success"
      : tone === "primary"
        ? "text-primary"
        : "text-foreground";
  const iconWrapCls =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "primary"
        ? "bg-primary/15 text-primary"
        : "bg-secondary/15 text-secondary";

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-elev-1 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
          {label}
        </div>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${iconWrapCls}`}>
          {icon}
        </span>
      </div>
      <div className={`mt-3 font-mono text-2xl font-semibold sm:text-3xl ${valueCls}`}>
        {value}
      </div>
      {hint !== undefined ? (
        <div className="mt-1 text-xs text-foreground-muted">{hint}</div>
      ) : null}
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  badge,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-surface p-5 shadow-elev-1 transition-colors hover:border-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground group-hover:text-primary">{title}</span>
          {badge !== undefined ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-foreground-muted">{description}</p>
      </div>
      <span className="self-center text-foreground-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
        <ArrowIcon />
      </span>
    </a>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function SubsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function RequestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function TokenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9 9.5h4.5a1.5 1.5 0 0 1 0 3H9h5" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function ManageUsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
