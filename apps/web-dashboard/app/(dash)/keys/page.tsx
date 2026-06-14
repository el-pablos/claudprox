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
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">API Key</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Pakai key di header Authorization atau x-api-key. Key cuma ditampilkan penuh sekali saat dibuat, jadi simpan baik-baik.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-elev-1">
        <h2 className="text-lg font-semibold text-foreground">Base URL gateway</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="block flex-1 overflow-x-auto rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-primary">
            {baseUrl}
          </code>
          <CopyButton value={baseUrl} label="Salin base URL" onCopied={() => setToast("Base URL disalin")} />
        </div>
        <p className="mt-3 text-xs text-foreground-muted">
          Contoh header:{" "}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-foreground">Authorization: Bearer cpx_live_...</code>
        </p>
        <p className="mt-2 text-xs text-foreground-muted">
          Pasang base URL ini di env variable CLI tool kamu (lihat{" "}
          <a
            href="https://claudprox.tams.codes/#cli"
            className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            daftar 18 CLI tool
          </a>
          ).
        </p>
      </section>

      <SecurityCallout />

      {created ? (
        <CreatedKeyCard
          plaintext={created.plaintext}
          onCopied={() => setToast("API key disalin")}
          onDismiss={() => setCreated(null)}
        />
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Daftar API key</h2>
          <button
            type="button"
            onClick={onCreate}
            disabled={creating}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {creating ? "Membuat..." : "Buat API key baru"}
          </button>
        </div>

        {loading ? (
          <KeyListSkeleton />
        ) : error ? (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 rounded border border-danger/40 px-3 py-1 text-xs text-danger hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Coba lagi
            </button>
          </div>
        ) : data && data.keys.length > 0 ? (
          <KeyList keys={data.keys} />
        ) : (
          <p className="rounded-xl border border-border bg-surface p-6 text-sm text-foreground-muted">
            Belum ada API key. Klik tombol di atas untuk membuat key pertama kamu.
          </p>
        )}
      </section>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-primary bg-surface px-4 py-2 text-sm text-primary shadow-elev-2"
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function SecurityCallout() {
  return (
    <section className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 sm:p-5">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-warning"
        aria-hidden="true"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      <div className="text-sm">
        <p className="font-semibold text-warning">Simpan API key kamu sekarang juga</p>
        <p className="mt-1 text-foreground-muted">
          Server hanya menyimpan <span className="font-medium text-foreground">hash</span> dari key, bukan nilai aslinya.
          Setelah dialog key baru ditutup atau halaman di-refresh, key tidak bisa dilihat lagi. Jangan pernah membagikan key
          ke orang lain atau menaruhnya di repository publik.
        </p>
      </div>
    </section>
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
    <section className="rounded-xl border border-primary bg-primary/5 p-6 shadow-glow">
      <h2 className="text-lg font-semibold text-primary">API key baru berhasil dibuat</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Salin sekarang juga. Setelah kartu ini ditutup atau halaman di-refresh, key TIDAK BISA dilihat lagi.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="block flex-1 overflow-x-auto break-all rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground">
          {revealed ? plaintext : masked}
        </code>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Sembunyikan API key" : "Tampilkan API key"}
            aria-pressed={revealed}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          <CopyButton value={plaintext} label="Salin API key" onCopied={onCopied} />
        </div>
      </div>
      {revealed ? (
        <p className="mt-2 text-xs text-warning">Key akan otomatis disembunyikan dalam 30 detik.</p>
      ) : null}
      <div className="mt-4">
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Sudah saya simpan
        </button>
      </div>
    </section>
  );
}

function KeyList({ keys }: { keys: KeyEntry[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background-elevated text-left text-xs uppercase tracking-wider text-foreground-muted">
            <tr>
              <th scope="col" className="px-4 py-2.5">Prefix</th>
              <th scope="col" className="px-4 py-2.5">Status</th>
              <th scope="col" className="px-4 py-2.5">Dibuat</th>
              <th scope="col" className="px-4 py-2.5">Terakhir dipakai</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-surface-hover">
                <td className="px-4 py-2.5 font-mono text-primary">{k.prefix}…</td>
                <td className="px-4 py-2.5">
                  <StatusBadge active={k.isActive} />
                </td>
                <td className="px-4 py-2.5 text-xs text-foreground-muted">
                  {new Date(k.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-2.5 text-xs text-foreground-muted">
                  {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("id-ID") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {keys.map((k) => (
          <li key={k.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <code className="break-all font-mono text-sm text-primary">{k.prefix}…</code>
              <StatusBadge active={k.isActive} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground-muted">
              <div>
                <dt className="uppercase tracking-wider">Dibuat</dt>
                <dd className="mt-0.5 text-foreground">{new Date(k.createdAt).toLocaleString("id-ID")}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wider">Terakhir dipakai</dt>
                <dd className="mt-0.5 text-foreground">
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

function KeyListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-skeleton" />
      ))}
    </div>
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
      className="inline-flex h-10 items-center justify-center rounded-lg border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      Salin
    </button>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  const cls = active ? "border-success/40 text-success" : "border-foreground-muted/40 text-foreground-muted";
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
