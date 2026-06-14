"use client";

import * as React from "react";
import { PLAN_DEFINITIONS } from "@claudprox/shared";

interface PaymentEntry {
  id: string;
  planName: string;
  amountIdr: number;
  method: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
  confirmedAt: string | null;
  note: string | null;
}

const TELEGRAM_URL = "https://t.me/ImTamaa";
const RECOMMENDED_PLAN = "Pro";

function formatRupiah(idr: number): string {
  return `Rp${idr.toLocaleString("id-ID")}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(1)} miliar`;
  if (tokens >= 1_000_000) return `${tokens / 1_000_000} juta`;
  return tokens.toLocaleString("id-ID");
}

export default function BuyPage() {
  const [payments, setPayments] = React.useState<PaymentEntry[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [createdId, setCreatedId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/me/payments");
      if (!res.ok) throw new Error("gagal");
      const body = (await res.json()) as { payments: PaymentEntry[] };
      setPayments(body.payments);
    } catch {
      setError("Gagal muat riwayat pembayaran");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onBuy = async (planName: string) => {
    if (loadingPlan !== null) return;
    setLoadingPlan(planName);
    setError(null);
    try {
      const res = await fetch("/api/me/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, method: "MANUAL_TRANSFER" }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "gagal");
      }
      const body = (await res.json()) as { id: string };
      setCreatedId(body.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal buat pembayaran");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Beli / Refill</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Pilih paket, transfer manual, lalu konfirmasi ke admin. Saldo token masuk otomatis setelah di-approve. API key kamu tetap sama saat refill.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        {PLAN_DEFINITIONS.map((plan) => {
          const featured = plan.name === RECOMMENDED_PLAN;
          const isLoading = loadingPlan === plan.name;
          return (
            <div
              key={plan.name}
              className={[
                "relative flex flex-col rounded-2xl border bg-surface p-6 shadow-elev-1",
                featured ? "border-primary shadow-glow ring-1 ring-secondary/40" : "border-border",
              ].join(" ")}
            >
              {featured ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full brand-gradient px-3 py-1 text-xs font-semibold text-foreground">
                  Paling laku
                </span>
              ) : null}

              <h2 className={`text-lg font-semibold ${featured ? "text-primary" : "text-foreground"}`}>
                {plan.name}
              </h2>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold text-foreground">{formatRupiah(plan.priceIdr)}</span>
                <span className="text-sm text-foreground-muted">/{plan.durationDays} hari</span>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                <Feature>{formatTokens(plan.tokens)} token kuota</Feature>
                <Feature>{plan.durationDays} hari masa aktif</Feature>
                <Feature>Rate limit {plan.rateLimitRpm} RPM</Feature>
                <Feature>Semua model termasuk Opus thinking + agentic</Feature>
                <Feature>SSE streaming aktif</Feature>
                <Feature>API key tetap saat refill</Feature>
              </ul>

              <button
                type="button"
                onClick={() => onBuy(plan.name)}
                disabled={isLoading}
                className={[
                  "mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border-strong text-foreground hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {isLoading ? "Memproses..." : `Beli ${plan.name}`}
              </button>
            </div>
          );
        })}
      </section>

      <PaymentMethodPanel />

      {createdId ? (
        <section className="rounded-xl border border-primary bg-primary/5 p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-primary">
            Pembayaran #{createdId.slice(0, 8)} berhasil dibuat
          </h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Transfer ke salah satu metode di atas, lalu kontak admin via{" "}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Telegram t.me/ImTamaa
            </a>{" "}
            untuk konfirmasi. Saldo masuk otomatis setelah admin approve.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{error}</p>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Riwayat pembayaran</h2>
        {payments === null ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl border border-border bg-skeleton" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-foreground-muted">
            Belum ada pembayaran. Pilih paket di atas untuk memulai.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-background-elevated text-left text-xs uppercase tracking-wider text-foreground-muted">
                  <tr>
                    <th className="px-4 py-2.5">Tanggal</th>
                    <th className="px-4 py-2.5">Paket</th>
                    <th className="px-4 py-2.5 text-right">Nominal</th>
                    <th className="px-4 py-2.5">Metode</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-hover">
                      <td className="px-4 py-2.5 text-foreground-muted">{new Date(p.createdAt).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-2.5 text-foreground">{p.planName}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-primary">{formatRupiah(p.amountIdr)}</td>
                      <td className="px-4 py-2.5 text-xs text-foreground-muted">{p.method}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {payments.map((p) => (
                <li key={p.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{p.planName}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-1 font-mono text-lg text-primary">{formatRupiah(p.amountIdr)}</div>
                  <div className="mt-2 flex items-center justify-between text-xs text-foreground-muted">
                    <span>{new Date(p.createdAt).toLocaleString("id-ID")}</span>
                    <span>{p.method}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-foreground-muted">
      <svg
        viewBox="0 0 20 20"
        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4L8.5 12l6.8-6.7a1 1 0 0 1 1.4 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </li>
  );
}

function PaymentMethodPanel() {
  const methods = ["QRIS", "BCA", "Virtual Account"];
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-elev-1">
      <h2 className="text-lg font-semibold text-foreground">Metode pembayaran</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Pembayaran manual. Pilih salah satu metode, transfer, lalu konfirmasi ke admin.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {methods.map((m) => (
          <span
            key={m}
            className="rounded-lg border border-border bg-background-elevated px-3 py-1.5 text-sm font-medium text-foreground"
          >
            {m}
          </span>
        ))}
      </div>
      <a
        href={TELEGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Konfirmasi via Telegram
      </a>
    </section>
  );
}

function StatusBadge({ status }: { status: PaymentEntry["status"] }) {
  const cls =
    status === "CONFIRMED"
      ? "border-success/40 text-success"
      : status === "REJECTED"
        ? "border-danger/40 text-danger"
        : "border-warning/40 text-warning";
  const label = status === "CONFIRMED" ? "Disetujui" : status === "REJECTED" ? "Ditolak" : "Menunggu";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
}
