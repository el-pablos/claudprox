"use client";

import * as React from "react";

interface PaymentRow {
  id: string;
  email: string;
  planName: string;
  amountIdr: number;
  method: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  createdAt: string;
  note: string | null;
}

interface ListResponse {
  payments: PaymentRow[];
}

type Filter = "PENDING" | "CONFIRMED" | "REJECTED" | "ALL";

const TABS: { value: Filter; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "Semua" },
];

export default function PaymentsPage() {
  const [filter, setFilter] = React.useState<Filter>("PENDING");
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<ListResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filter === "ALL" ? "/api/admin/payments" : `/api/admin/payments?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("gagal");
      const body = (await res.json()) as ListResponse;
      setData(body);
    } catch {
      setError("Gagal muat pembayaran");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onConfirm = async (id: string) => {
    if (!confirm("Yakin approve pembayaran ini? Saldo akan langsung di-refill.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/confirm`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        alert(body.error?.message ?? "Gagal approve");
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (id: string) => {
    const reason = prompt("Alasan penolakan?");
    if (reason === null || reason.trim() === "") return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/payments/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        alert(body.error?.message ?? "Gagal reject");
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const payments = data?.payments ?? [];

  const counts = React.useMemo(() => {
    const acc = { PENDING: 0, CONFIRMED: 0, REJECTED: 0, ALL: 0 };
    for (const p of payments) {
      acc.ALL += 1;
      acc[p.status] += 1;
    }
    return acc;
  }, [payments]);

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === "") return payments;
    return payments.filter((p) => p.email.toLowerCase().includes(query));
  }, [payments, search]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pembayaran
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Approve atau reject pembayaran user. Saldo refill otomatis setelah approve.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Pending" value={counts.PENDING} tone="warning" />
        <SummaryCard label="Confirmed" value={counts.CONFIRMED} tone="success" />
        <SummaryCard label="Rejected" value={counts.REJECTED} tone="danger" />
        <SummaryCard label="Total dimuat" value={counts.ALL} tone="neutral" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Filter status pembayaran"
          className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1"
        >
          {TABS.map((tab) => {
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.value)}
                className={
                  active
                    ? "rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    : "rounded-md px-3 py-1.5 text-sm text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative sm:max-w-xs sm:flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari email..."
            aria-label="Cari pembayaran berdasarkan email"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-foreground-muted">Memuat pembayaran...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-danger/40 bg-danger/5 p-6">
          <p className="text-sm text-danger">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Coba lagi
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-10 text-center">
          <p className="text-sm text-foreground-muted">
            {search.trim() !== ""
              ? "Tidak ada pembayaran cocok dengan pencarian."
              : "Tidak ada pembayaran dengan filter ini."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface shadow-elev-1 md:block">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-surface-hover text-left text-xs uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-4 py-3 text-xs text-foreground-muted">
                      {new Date(p.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.email}</td>
                    <td className="px-4 py-3 text-foreground-muted">{p.planName}</td>
                    <td className="px-4 py-3 text-right font-mono text-primary">
                      Rp{p.amountIdr.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground-muted">{p.method}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onConfirm(p.id)}
                            disabled={busyId === p.id}
                            className="rounded-lg border border-success/40 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReject(p.id)}
                            disabled={busyId === p.id}
                            className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-foreground-muted">{p.note ?? "—"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-elev-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 flex-1 break-all text-sm font-medium text-foreground">
                    {p.email}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-foreground-muted">{p.planName}</span>
                  <span className="font-mono text-sm text-primary">
                    Rp{p.amountIdr.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground-muted">
                  <span>{p.method}</span>
                  <span>{new Date(p.createdAt).toLocaleString("id-ID")}</span>
                </div>
                {p.status === "PENDING" ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onConfirm(p.id)}
                      disabled={busyId === p.id}
                      className="flex-1 rounded-lg border border-success/40 px-3 py-2 text-sm font-medium text-success transition-colors hover:bg-success/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(p.id)}
                      disabled={busyId === p.id}
                      className="flex-1 rounded-lg border border-danger/40 px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Reject
                    </button>
                  </div>
                ) : p.note !== null && p.note !== "" ? (
                  <p className="mt-3 text-xs text-foreground-muted">Catatan: {p.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "success" | "danger" | "neutral";
}) {
  const valueCls =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : tone === "danger"
          ? "text-danger"
          : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-elev-1">
      <div className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
        {label}
      </div>
      <div className={`mt-1 font-mono text-2xl font-semibold ${valueCls}`}>
        {value.toLocaleString("id-ID")}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentRow["status"] }) {
  const cls =
    status === "CONFIRMED"
      ? "border-success/40 bg-success/10 text-success"
      : status === "REJECTED"
        ? "border-danger/40 bg-danger/10 text-danger"
        : "border-warning/40 bg-warning/10 text-warning";
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${cls}`}
    >
      {status}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
