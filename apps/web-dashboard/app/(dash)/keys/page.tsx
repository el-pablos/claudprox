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

export default function KeysPage() {
  const [data, setData] = React.useState<MeResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CreateResponse | null>(null);
  const [creating, setCreating] = React.useState(false);

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

  const onCreate = async () => {
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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-50">API Key</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pakai key di header Authorization atau x-api-key.
        </p>
      </header>

      <section className="rounded-lg border border-ctos-border bg-ctos-panel p-6">
        <h2 className="text-lg font-semibold text-slate-100">Base URL gateway</h2>
        <code className="mt-3 block rounded-md border border-ctos-border bg-ctos-bg px-4 py-3 font-mono text-sm text-ctos-accent">
          {data?.baseUrl ?? "https://api.claudprox.tams.codes"}
        </code>
        <p className="mt-2 text-xs text-slate-500">
          Pasang base URL ini di env variable CLI tool kamu (lihat <a href="https://claudprox.tams.codes/#cli" className="text-ctos-accent hover:underline">daftar 18 CLI tool</a>).
        </p>
      </section>

      {created ? (
        <section className="rounded-lg border border-ctos-accent bg-ctos-accent/5 p-6">
          <h2 className="text-lg font-semibold text-ctos-accent">API key baru</h2>
          <p className="mt-1 text-sm text-slate-300">
            Salin sekarang juga. Setelah halaman ini di-refresh, plaintext key TIDAK BISA dilihat lagi.
          </p>
          <code className="mt-3 block break-all rounded-md border border-ctos-border bg-ctos-bg px-4 py-3 font-mono text-sm text-slate-50">
            {created.plaintext}
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(created.plaintext)}
            className="mt-3 rounded border border-ctos-accent px-3 py-1 text-xs text-ctos-accent hover:bg-ctos-accent hover:text-ctos-bg"
          >
            Salin
          </button>
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="ml-2 rounded border border-ctos-border px-3 py-1 text-xs text-slate-400 hover:border-ctos-accent"
          >
            Sudah disimpan
          </button>
        </section>
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
          <p className="text-sm text-red-400">{error}</p>
        ) : data && data.keys.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-ctos-border">
            <table className="min-w-full divide-y divide-ctos-border text-sm">
              <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-2">Prefix</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Dibuat</th>
                  <th className="px-4 py-2">Terakhir dipakai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
                {data.keys.map((k) => (
                  <tr key={k.id}>
                    <td className="px-4 py-2 font-mono text-ctos-accent">{k.prefix}...</td>
                    <td className="px-4 py-2 text-slate-300">
                      {k.isActive ? "Aktif" : "Nonaktif"}
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
        ) : (
          <p className="rounded-md border border-ctos-border bg-ctos-panel p-6 text-sm text-slate-400">
            Belum ada API key. Klik tombol di atas untuk membuat.
          </p>
        )}
      </section>
    </div>
  );
}
