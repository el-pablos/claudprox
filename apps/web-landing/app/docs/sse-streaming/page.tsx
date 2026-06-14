import type { Metadata } from "next";
import { DocsHeader } from "../../../components/docs/DocsHeader";
import { Footer } from "../../../components/landing/Footer";
import { CodeBlock } from "../../../components/ui/Dialog";

export const metadata: Metadata = {
  title: "SSE Streaming",
  description: "Cara konsumsi response streaming dari TamsHub ClaudProx.",
};

const STREAM_CURL = `curl -N -X POST https://api-claudprox.tams.codes/v1/chat/completions \\
  -H "Authorization: Bearer <API_KEY_KAMU>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-opus-4-8",
    "stream": true,
    "messages": [{"role": "user", "content": "Hitung 1 sampai 5"}]
  }'`;

const STREAM_NODE = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.CLAUDPROX_API_KEY,
  baseURL: "https://api-claudprox.tams.codes/v1",
});

const stream = await client.chat.completions.create({
  model: "claude-opus-4-8",
  messages: [{ role: "user", content: "Hitung 1 sampai 5" }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content ?? "";
  process.stdout.write(delta);
}`;

export default function SsePage() {
  return (
    <main>
      <DocsHeader />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <header>
          <a href="/docs" className="text-xs text-foreground-muted hover:text-ctos-accent">← Docs</a>
          <h1 className="mt-3 text-3xl font-bold text-slate-50">SSE Streaming</h1>
          <p className="mt-2 text-slate-400">
            Pakai <span className="font-mono">stream: true</span> supaya response keluar real-time.
            Direkomendasikan untuk request panjang biar ga kena timeout 300 detik.
          </p>
        </header>

        <h2 className="text-lg font-semibold text-slate-100">curl streaming</h2>
        <CodeBlock code={STREAM_CURL} />
        <p className="text-sm text-slate-400">
          Flag <span className="font-mono">-N</span> wajib supaya curl ga buffer output.
        </p>

        <h2 className="text-lg font-semibold text-slate-100">Node SDK</h2>
        <CodeBlock code={STREAM_NODE} />

        <h2 className="text-lg font-semibold text-slate-100">Format chunk</h2>
        <p className="text-sm text-slate-300">
          Tiap chunk dimulai dengan <span className="font-mono">data:</span> diikuti JSON. Chunk terakhir
          adalah <span className="font-mono">data: [DONE]</span>. Field <span className="font-mono">usage</span>{" "}
          biasanya muncul di chunk sebelum DONE — gateway pakai itu untuk metering token akurat.
        </p>

        <h2 className="text-lg font-semibold text-slate-100">Cancel</h2>
        <p className="text-sm text-slate-300">
          Tutup koneksi HTTP (close/abort) untuk membatalkan request. Gateway nge-propagate cancellation ke
          upstream supaya saldo kamu ga terus dipake.
        </p>

        <p className="text-sm text-slate-400">
          Lanjut: <a href="/docs/error-codes" className="text-ctos-accent hover:underline">Kode Galat</a> →
        </p>
      </article>
      <Footer />
    </main>
  );
}
