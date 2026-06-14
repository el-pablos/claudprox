"use client";

import * as React from "react";

interface KeyEntry {
  id: string;
  prefix: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

interface MeResponse {
  baseUrl: string;
  keys: KeyEntry[];
}

interface CreateResponse {
  plaintext: string;
  prefix: string;
}

const AUTO_HIDE_MS = 30_000;

export default function KeysPage() {
  const [data, setData] = React.useState<MeResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CreateResponse | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/keys");
      if (!res.ok) throw new Error("gagal");
      const body = (await res.json()) as MeResponse;
      setData(body);
    } catch {
      setError("Gagal muat daftar API key");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (toast === null) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const onCreate = async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/me/keys", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
        throw new Error(body.error?.message ?? "gagal");
      }
      const body = (await res.json()) as CreateResponse;
      setCreated(body);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal buat API key");
    } finally {
      setCreating(false);
    }
  };

  const baseUrl = data?.baseUrl ?? "https://api-claudprox.tams.codes";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">API Key</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pakai key di header Authorization atau x-api-key. Key cuma ditampilkan penuh sekali saat dibuat, jadi simpan baik-baik.
        </p>
      </header>

      <section className="rounded-lg border border-ctos-border bg-ctos-panel p-6">
        <h2 className="text-lg font-semibold text-slate-100">Base URL gateway</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="block flex-1 overflow-x-auto rounded-md border border-ctos-border bg-ctos-bg px-4 py-3 font-mono text-sm text-ctos-accent">
            {baseUrl}
          </code>
          <CopyButton
            value={baseUrl}
            label="Salin base URL"
            onCopied={() => setToast("Base URL disalin")}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Contoh header:{" "}
          <code className="font-mono text-slate-400">Authorization: Bearer cpx_live_...</code>
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Pasang base URL ini di env variable CLI tool kamu (lihat{" "}
          <a href="https://claudprox.tams.codes/#cli" className="text-ctos-accent hover:underline">
            daftar 18 CLI tool
          </a>
          ).
        </p>
      </section>

      {created ? (
        <CreatedKeyCard
          plaintext={created.plaintext}
          onCopied={() => setToast("API key disalin")}
          onDismiss={() => setCreated(null)}
        />
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Daftar API key</h2>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="rounded-md bg-ctos-accent px-4 py-2 text-sm font-semibold text-ctos-bg hover:bg-ctos-accentDim disabled:opacity-50"
          >
            {creating ? "Membuat..." : "Buat API key baru"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Memuat...</p>
        ) : error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 rounded border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:bg-red-500/20"
            >
              Coba lagi
            </button>
          </div>
        ) : data && data.keys.length > 0 ? (
          <KeyList keys={data.keys} />
        ) : (
          <p className="rounded-md border border-ctos-border bg-ctos-panel p-6 text-sm text-slate-400">
            Belum ada API key. Klik tombol di atas untuk membuat.
          </p>
        )}
      </section>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-ctos-accent bg-ctos-panel px-4 py-2 text-sm text-ctos-accent shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function CreatedKeyCard({
  plaintext,
  onCopied,
  onDismiss,
}: {
  plaintext: string;
  onCopied: () => void;
  onDismiss: () => void;
}) {
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    if (!revealed) return;
    const timer = setTimeout(() => setRevealed(false), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
  }, [revealed]);

  const masked = maskKey(plaintext);

  return (
    <section className="rounded-lg border border-ctos-accent bg-ctos-accent/5 p-6">
      <h2 className="text-lg font-semibold text-ctos-accent">API key baru</h2>
      <p className="mt-1 text-sm text-slate-300">
        Salin sekarang juga. Setelah kartu ini ditutup atau halaman di-refresh, key TIDAK BISA dilihat lagi.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="block flex-1 overflow-x-auto break-all rounded-md border border-ctos-border bg-ctos-bg px-4 py-3 font-mono text-sm text-slate-50">
          {revealed ? plaintext : masked}
        </code>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Sembunyikan API key" : "Tampilkan API key"}
            aria-pressed={revealed}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ctos-border text-slate-200 hover:border-ctos-accent hover:text-ctos-accent"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          <CopyButton value={plaintext} label="Salin API key" onCopied={onCopied} />
        </div>
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded border border-ctos-border px-3 py-1 text-xs text-slate-400 hover:border-ctos-accent"
        >
          Sudah disimpan
        </button>
      </div>
    </section>
  );
}

function KeyList({ keys }: { keys: KeyEntry[] }) {
  return (
    <>
      {/* Tampilan tabel untuk layar lebar */}
      <div className="hidden overflow-x-auto rounded-lg border border-ctos-border sm:block">
        <table className="min-w-full divide-y divide-ctos-border text-sm">
          <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-2">Prefix</th>
              <th scope="col" className="px-4 py-2">Status</th>
              <th scope="col" className="px-4 py-2">Dibuat</th>
              <th scope="col" className="px-4 py-2">Terakhir dipakai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
            {keys.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-2 font-mono text-ctos-accent">{k.prefix}…</td>
                <td className="px-4 py-2">
                  <StatusBadge active={k.isActive} />
                </td>
                <td className="px-4 py-2 text-xs text-slate-500">
                  {new Date(k.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2 text-xs text-slate-500">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("id-ID") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilan kartu untuk mobile */}
      <ul className="space-y-3 sm:hidden">
        {keys.map((k) => (
          <li
            key={k.id}
            className="rounded-lg border border-ctos-border bg-ctos-panel p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <code className="break-all font-mono text-sm text-ctos-accent">{k.prefix}…</code>
              <StatusBadge active={k.isActive} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <dt className="uppercase tracking-wider">Dibuat</dt>
                <dd className="mt-0.5 text-slate-400">
                  {new Date(k.createdAt).toLocaleString("id-ID")}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider">Terakhir dipakai</dt>
                <dd className="mt-0.5 text-slate-400">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("id-ID") : "—"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function CopyButton({
  value,
  label,
  onCopied,
}: {
  value: string;
  label: string;
  onCopied: () => void;
}) {
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      onCopied();
    } catch {
      // Clipboard API bisa gagal di konteks non-secure; abaikan tanpa mencetak value.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      aria-label={label}
      className="inline-flex h-10 items-center justify-center rounded-md border border-ctos-accent px-3 text-sm text-ctos-accent hover:bg-ctos-accent hover:text-ctos-bg"
    >
      Salin
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  const cls = active
    ? "border-emerald-500/40 text-emerald-400"
    : "border-slate-500/40 text-slate-400";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function maskKey(value: string): string {
  if (value.length <= 12) return "•".repeat(value.length);
  return `${value.slice(0, 8)}${"•".repeat(16)}${value.slice(-4)}`;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.2 4.2M6.6 6.6A17.8 17.8 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4.1-.8" />
      <path d="m2 2 20 20" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
