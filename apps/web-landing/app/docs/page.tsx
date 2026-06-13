import type { Metadata } from "next";
import { Footer } from "../../components/landing/Footer";

export const metadata: Metadata = {
  title: "Dokumentasi",
  description: "Dokumentasi gateway TamsHub ClaudProx — quick start, endpoint, autentikasi, model, SSE, kode galat.",
};

interface DocSection {
  href: string;
  title: string;
  blurb: string;
}

const SECTIONS: DocSection[] = [
  { href: "/docs/quick-start", title: "Quick Start", blurb: "Panggil endpoint pertama dalam 60 detik." },
  { href: "/docs/endpoints", title: "Endpoint", blurb: "GET /v1/models, POST /v1/chat/completions, POST /v1/messages." },
  { href: "/docs/auth", title: "Autentikasi", blurb: "Pakai API key kamu via Authorization atau x-api-key." },
  { href: "/docs/models", title: "Model", blurb: "52 model whitelist Anthropic dan partner. Format id versi user." },
  { href: "/docs/sse-streaming", title: "SSE Streaming", blurb: "Cara konsumsi response streaming dengan benar." },
  { href: "/docs/error-codes", title: "Kode Galat", blurb: "401, 402, 403, 429, 504 — pesan dan cara handle." },
];

export default function DocsIndex() {
  return (
    <main>
      <DocsHeader />
      <section className="border-b border-ctos-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-4xl font-bold text-slate-50">Dokumentasi</h1>
          <p className="mt-3 text-slate-400">
            Dokumentasi resmi gateway. Endpoint OpenAI sama Anthropic compatible, jadi kamu pakai SDK existing.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="block rounded-lg border border-ctos-border bg-ctos-panel p-6 transition hover:border-ctos-accent"
              >
                <h2 className="text-lg font-semibold text-ctos-accent">{s.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{s.blurb}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function DocsHeader() {
  return (
    <nav className="sticky top-0 z-40 border-b border-ctos-border bg-ctos-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 text-sm">
        <a href="/" className="font-mono text-ctos-accent">
          ClaudProx
        </a>
        <div className="flex items-center gap-5 text-slate-300">
          <a href="/docs" className="hover:text-ctos-accent">Docs</a>
          <a href="/pricing" className="hover:text-ctos-accent">Harga</a>
          <a href="https://dashboard.claudprox.tams.codes" className="hover:text-ctos-accent">Masuk</a>
        </div>
      </div>
    </nav>
  );
}
