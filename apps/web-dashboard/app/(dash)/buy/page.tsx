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

function formatRupiah(idr: number): string {
  return `Rp${idr.toLocaleString("id-ID")}`;
}

export default function BuyPage() {
  const [payments, setPayments] = React.useState<PaymentEntry[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">Beli / Refill</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pilih paket. Setelah transfer, kontak admin di Telegram untuk approval. Saldo nambah otomatis ke API key kamu.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {PLAN_DEFINITIONS.map((plan) => (
          <div
            key={plan.name}
            className="flex flex-col rounded-lg border border-ctos-border bg-ctos-panel p-6"
          >
            <h2 className="text-lg font-semibold text-ctos-accent">{plan.name}</h2>
            <div className="mt-2 text-2xl font-bold text-slate-50">{formatRupiah(plan.priceIdr)}</div>
            <ul className="mt-3 space-y-1 text-sm text-slate-300">
              <li>{(plan.tokens / 1_000_000).toFixed(0)}M token</li>
              <li>{plan.durationDays} hari masa aktif</li>
              <li>{plan.rateLimitRpm} RPM</li>
            </ul>
            <button
              type="button"
              onClick={() => onBuy(plan.name)}
              disabled={loading}
              className="mt-auto rounded-md bg-ctos-accent px-4 py-2 pt-2 text-sm font-semibold text-ctos-bg hover:bg-ctos-accentDim disabled:opacity-50"
            >
              {loading ? "Memproses..." : `Beli ${plan.name}`}
            </button>
          </div>
        ))}
      </section>

      {createdId ? (
        <section className="rounded-lg border border-ctos-accent bg-ctos-accent/5 p-6">
          <h2 className="text-lg font-semibold text-ctos-accent">Pembayaran #{createdId.slice(0, 8)} dibuat</h2>
          <p className="mt-2 text-sm text-slate-300">
            Transfer ke salah satu metode: QRIS, BCA, Virtual Account. Lalu kontak admin via{" "}
            <a href="https://t.me/ImTamaa" target="_blank" rel="noreferrer" className="text-ctos-accent hover:underline">
              Telegram t.me/ImTamaa
            </a>{" "}
            untuk konfirmasi. Saldo masuk otomatis setelah admin approve.
          </p>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Riwayat pembayaran</h2>
        {payments === null ? (
          <p className="text-sm text-slate-400">Memuat...</p>
        ) : payments.length === 0 ? (
          <p className="rounded-md border border-ctos-border bg-ctos-panel p-6 text-sm text-slate-400">
            Belum ada pembayaran.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ctos-border">
            <table className="min-w-full divide-y divide-ctos-border text-sm">
              <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Paket</th>
                  <th className="px-4 py-2 text-right">Nominal</th>
                  <th className="px-4 py-2">Metode</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-slate-400">{new Date(p.createdAt).toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 text-slate-200">{p.planName}</td>
                    <td className="px-4 py-2 text-right font-mono text-ctos-accent">
                      {formatRupiah(p.amountIdr)}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">{p.method}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={p.status} />
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

function StatusBadge({ status }: { status: PaymentEntry["status"] }) {
  const cls =
    status === "CONFIRMED"
      ? "border-emerald-500/40 text-emerald-400"
      : status === "REJECTED"
        ? "border-red-500/40 text-red-400"
        : "border-amber-500/40 text-amber-400";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}
