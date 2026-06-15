import type { Metadata } from "next";
import { DocsHeader } from "../../../components/docs/DocsHeader";
import { Footer } from "../../../components/landing/Footer";

export const metadata: Metadata = {
  title: "Kode Galat",
  description: "Kode galat dari gateway TamsHub ClaudProx dan cara handle.",
};

interface ErrorEntry {
  code: number;
  type: string;
  meaning: string;
  fix: string;
}

const ERRORS: ErrorEntry[] = [
  {
    code: 400,
    type: "bad_request / invalid_model",
    meaning: "Body request tidak valid atau model id tidak ada di whitelist.",
    fix: "Cek model id (TANPA kr/, titik diganti strip). Lihat /docs/models.",
  },
  {
    code: 401,
    type: "invalid_api_key",
    meaning: "API key tidak ditemukan atau sudah nonaktif.",
    fix: "Generate ulang dari dashboard. Cek apakah header Authorization terkirim.",
  },
  {
    code: 402,
    type: "insufficient_tokens",
    meaning: "Saldo token habis untuk langganan aktif kamu.",
    fix: "Beli paket lagi di dashboard /buy. Setelah admin approve, saldo nambah otomatis.",
  },
  {
    code: 403,
    type: "subscription_expired",
    meaning: "Masa aktif langganan habis atau langganan di-suspend.",
    fix: "Beli paket baru. expires_at akan diperpanjang otomatis.",
  },
  {
    code: 429,
    type: "rate_limited",
    meaning: "Request per menit melewati batas paket kamu.",
    fix: "Tunggu sebentar lalu retry. Upgrade paket kalau butuh RPM lebih tinggi.",
  },
  {
    code: 500,
    type: "internal_error",
    meaning: "Error tak terduga di gateway.",
    fix: "Retry. Kalau persisten, kontak admin di Telegram t.me/ImTamaa.",
  },
  {
    code: 502,
    type: "upstream_error",
    meaning: "Upstream proxy nge-return error.",
    fix: "Retry dengan backoff. Cek status upstream kalau persisten.",
  },
  {
    code: 504,
    type: "gateway_timeout",
    meaning: "Upstream tidak respons dalam 300 detik.",
    fix: "Pakai stream: true untuk request panjang. Pecah prompt jadi lebih pendek.",
  },
];

export default function ErrorCodesPage() {
  return (
    <main>
      <DocsHeader />
      <article className="mx-auto max-w-4xl space-y-6 px-6 py-16">
        <header>
          <a href="/docs" className="text-xs text-foreground-muted hover:text-ctos-accent">← Docs</a>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Kode Galat</h1>
          <p className="mt-2 text-foreground-muted">
            Format error konsisten. Body JSON selalu punya field{" "}
            <span className="font-mono text-ctos-accent">{"error.type"}</span> dan{" "}
            <span className="font-mono text-ctos-accent">{"error.message"}</span>.
          </p>
        </header>

        <pre className="overflow-x-auto rounded-md border border-ctos-border bg-ctos-bg p-4 text-xs font-mono text-foreground-muted">
{`{
  "error": {
    "type": "insufficient_tokens",
    "message": "Saldo token habis. Silakan beli paket lagi."
  }
}`}
        </pre>

        <div className="overflow-x-auto rounded-lg border border-ctos-border">
          <table className="min-w-full divide-y divide-ctos-border text-sm">
            <thead className="bg-ctos-panel/60 text-left text-xs uppercase tracking-wider text-foreground-muted">
              <tr>
                <th className="px-4 py-2">Kode</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Arti</th>
                <th className="px-4 py-2">Cara handle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ctos-border bg-ctos-bg/40">
              {ERRORS.map((e) => (
                <tr key={e.code}>
                  <td className="px-4 py-3 font-mono text-ctos-warn">{e.code}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{e.type}</td>
                  <td className="px-4 py-3 text-foreground-muted">{e.meaning}</td>
                  <td className="px-4 py-3 text-foreground-muted">{e.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <Footer />
    </main>
  );
}
