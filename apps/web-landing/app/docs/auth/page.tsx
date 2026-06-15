import type { Metadata } from "next";
import { DocsHeader } from "../../../components/docs/DocsHeader";
import { Footer } from "../../../components/landing/Footer";
import { CodeBlock } from "../../../components/ui/Dialog";

export const metadata: Metadata = {
  title: "Autentikasi",
  description: "Cara pakai API key di TamsHub ClaudProx.",
};

export default function AuthPage() {
  return (
    <main>
      <DocsHeader />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <header>
          <a href="/docs" className="text-xs text-foreground-muted hover:text-ctos-accent">← Docs</a>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Autentikasi</h1>
          <p className="mt-2 text-foreground-muted">
            Pakai API key kamu di header. Dua format diterima.
          </p>
        </header>

        <h2 className="text-lg font-semibold text-foreground">Format API key</h2>
        <p className="text-sm text-foreground-muted">
          API key kamu diawali <span className="font-mono text-ctos-accent">cpx_live_</span> diikuti string acak panjang.
          Tampil penuh sekali saat generate; setelah itu cuma prefix yang muncul di dashboard.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Cara kirim</h2>
        <p className="text-sm text-foreground-muted">Salah satu dari dua header berikut diterima:</p>
        <CodeBlock code="Authorization: Bearer <API_KEY_KAMU>" />
        <CodeBlock code="x-api-key: <API_KEY_KAMU>" />

        <h2 className="text-lg font-semibold text-foreground">Rotate key</h2>
        <p className="text-sm text-foreground-muted">
          Kalau key kamu bocor, masuk ke dashboard, klik rotate key. Key lama langsung nonaktif, key baru
          generate sekali. Saldo dan langganan kamu tetap. Refill paket TIDAK bikin key baru.
        </p>

        <h2 className="text-lg font-semibold text-foreground">Kode galat auth</h2>
        <ul className="space-y-1 text-sm text-foreground-muted">
          <li><span className="font-mono text-ctos-warn">401</span> — API key tidak valid atau nonaktif.</li>
          <li><span className="font-mono text-ctos-warn">402</span> — Saldo token habis. Beli paket lagi.</li>
          <li><span className="font-mono text-ctos-warn">403</span> — Langganan kedaluwarsa atau di-suspend.</li>
        </ul>

        <p className="text-sm text-foreground-muted">
          Lanjut: <a href="/docs/models" className="text-ctos-accent hover:underline">Model yang Didukung</a> →
        </p>
      </article>
      <Footer />
    </main>
  );
}
