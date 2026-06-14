import type { Metadata } from "next";
import { DocsHeader } from "../../../components/docs/DocsHeader";
import { Footer } from "../../../components/landing/Footer";
import { CodeBlock } from "../../../components/ui/Dialog";

export const metadata: Metadata = {
  title: "Quick Start",
  description: "Mulai pakai TamsHub ClaudProx dalam 60 detik.",
};

const CURL_OPENAI = `curl -X POST https://api-claudprox.tams.codes/v1/chat/completions \\
  -H "Authorization: Bearer <API_KEY_KAMU>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "Halo"}],
    "stream": false
  }'`;

const CURL_ANTHROPIC = `curl -X POST https://api-claudprox.tams.codes/v1/messages \\
  -H "x-api-key: <API_KEY_KAMU>" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-opus-4-8",
    "max_tokens": 256,
    "messages": [{"role": "user", "content": "Halo"}]
  }'`;

const NODE_SDK = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.CLAUDPROX_API_KEY,
  baseURL: "https://api-claudprox.tams.codes/v1",
});

const res = await client.chat.completions.create({
  model: "claude-opus-4-8",
  messages: [{ role: "user", content: "Halo" }],
});
console.log(res.choices[0].message.content);`;

export default function QuickStartPage() {
  return (
    <main>
      <DocsHeader />
      <article className="mx-auto max-w-3xl space-y-8 px-6 py-16">
        <header>
          <a href="/docs" className="text-xs text-foreground-muted hover:text-ctos-accent">← Docs</a>
          <h1 className="mt-3 text-3xl font-bold text-slate-50">Quick Start</h1>
          <p className="mt-2 text-slate-400">
            Tiga langkah supaya request pertama kamu jalan.
          </p>
        </header>

        <Step n={1} title="Daftar sama beli paket">
          <p className="text-sm text-slate-300">
            Buka{" "}
            <a className="text-ctos-accent underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" href="https://dashboard-claudprox.tams.codes">
              dashboard
            </a>{" "}
            kamu, daftar, terus pilih paket. Setelah admin approve, saldo token sama API key langsung muncul.
          </p>
        </Step>

        <Step n={2} title="Catat Base URL sama API key">
          <p className="text-sm text-slate-300">Base URL gateway:</p>
          <CodeBlock code="https://api-claudprox.tams.codes" />
          <p className="mt-3 text-sm text-slate-300">
            API key format <span className="font-mono text-ctos-accent">cpx_live_...</span>. Tampil sekali waktu generate; simpan baik-baik.
          </p>
        </Step>

        <Step n={3} title="Panggil endpoint">
          <h3 className="mb-2 text-xs uppercase tracking-wider text-foreground-muted">curl OpenAI compatible</h3>
          <CodeBlock code={CURL_OPENAI} />
          <h3 className="mb-2 mt-6 text-xs uppercase tracking-wider text-foreground-muted">curl Anthropic compatible</h3>
          <CodeBlock code={CURL_ANTHROPIC} />
          <h3 className="mb-2 mt-6 text-xs uppercase tracking-wider text-foreground-muted">Node SDK (openai)</h3>
          <CodeBlock code={NODE_SDK} />
        </Step>

        <p className="text-sm text-slate-400">
          Lanjut: <a href="/docs/endpoints" className="text-ctos-accent underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Endpoint</a> →
        </p>
      </article>
      <Footer />
    </main>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-3 text-xl font-semibold text-slate-100">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ctos-accent text-sm text-ctos-accent">
          {n}
        </span>
        {title}
      </h2>
      <div className="ml-11 space-y-3">{children}</div>
    </section>
  );
}
