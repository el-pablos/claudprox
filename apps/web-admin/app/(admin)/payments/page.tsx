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

export default function PaymentsPage() {
  const [filter, setFilter] = React.useState<"PENDING" | "CONFIRMED" | "REJECTED" | "ALL">(
    "PENDING",
  );
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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Pembayaran</h1>
          <p className="mt-1 text-sm text-slate-400">Approve atau reject pembayaran user.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-md border border-ctos-border bg-ctos-bg px-3 py-2 text-sm text-slate-100"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">Semua</option>
        </select>
      </header>

      {loading ? (
        <p className="text-sm text-slate-400">Memuat...</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : !data || data.payments.length === 0 ? (
        <p className="rounded-md border border-ctos-border bg-ctos-panel p-6 text-sm text-slate-400">
          Tidak ada pembayaran dengan filter ini.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ctos-border">
          <table className="min-w-full divide-y divide-ctos-border text-sm">
            <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Paket</th>
                <th className="px-4 py-2 text-right">Nominal</th>
                <th className="px-4 py-2">Metode</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
              {data.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(p.createdAt).toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2 text-slate-200">{p.email}</td>
                  <td className="px-4 py-2 text-slate-300">{p.planName}</td>
                  <td className="px-4 py-2 text-right font-mono text-ctos-accent">
                    Rp{p.amountIdr.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">{p.method}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    {p.status === "PENDING" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onConfirm(p.id)}
                          disabled={busyId === p.id}
                          className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(p.id)}
                          disabled={busyId === p.id}
                          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">{p.note ?? "—"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PaymentRow["status"] }) {
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
