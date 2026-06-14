import type { Metadata } from "next";
import { DocsHeader } from "../../../components/docs/DocsHeader";
import { Footer } from "../../../components/landing/Footer";
import { CodeBlock } from "../../../components/ui/Dialog";

export const metadata: Metadata = {
  title: "Endpoint",
  description: "Daftar endpoint gateway TamsHub ClaudProx.",
};

export default function EndpointsPage() {
  return (
    <main>
      <DocsHeader />
      <article className="mx-auto max-w-3xl space-y-8 px-6 py-16">
        <header>
          <a href="/docs" className="text-xs text-slate-500 hover:text-ctos-accent">← Docs</a>
          <h1 className="mt-3 text-3xl font-bold text-slate-50">Endpoint</h1>
          <p className="mt-2 text-slate-400">
            Empat endpoint utama. Tiga di antaranya butuh API key, satu (health) public.
          </p>
        </header>

        <Endpoint method="GET" path="/v1/models" auth>
          <p>Daftar model whitelist (52 model). ID model versi user, tanpa prefix kr/.</p>
          <CodeBlock code={`curl https://api-claudprox.tams.codes/v1/models \\
  -H "Authorization: Bearer <API_KEY_KAMU>"`} />
        </Endpoint>

        <Endpoint method="POST" path="/v1/chat/completions" auth>
          <p>OpenAI-compatible. Mendukung <span className="font-mono">stream: true</span> untuk SSE.</p>
          <CodeBlock code={`{
  "model": "claude-opus-4-8",
  "messages": [
    { "role": "system", "content": "Kamu asisten ramah." },
    { "role": "user", "content": "Tulis haiku tentang kopi" }
  ],
  "max_tokens": 200,
  "stream": false
}`} />
        </Endpoint>

        <Endpoint method="POST" path="/v1/messages" auth>
          <p>Anthropic-compatible. Header <span className="font-mono">x-api-key</span> atau Authorization Bearer keduanya diterima.</p>
          <CodeBlock code={`{
  "model": "claude-opus-4-8",
  "max_tokens": 256,
  "messages": [
    { "role": "user", "content": "Sebutkan 3 manfaat tidur cukup" }
  ]
}`} />
        </Endpoint>

        <Endpoint method="GET" path="/health">
          <p>Health check internal. Tidak butuh API key. Jangan dipakai sebagai endpoint produksi.</p>
        </Endpoint>

        <p className="text-sm text-slate-400">
          Lanjut: <a href="/docs/auth" className="text-ctos-accent hover:underline">Autentikasi</a> →
        </p>
      </article>
      <Footer />
    </main>
  );
}

function Endpoint({
  method,
  path,
  auth,
  children,
}: {
  method: "GET" | "POST";
  path: string;
  auth?: boolean;
  children: React.ReactNode;
}) {
  const tone = method === "GET" ? "text-emerald-400" : "text-amber-300";
  return (
    <section className="rounded-lg border border-ctos-border bg-ctos-panel p-6">
      <div className="mb-3 flex items-center gap-3">
        <span className={`font-mono text-xs ${tone}`}>{method}</span>
        <code className="font-mono text-sm text-slate-100">{path}</code>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-500">
          {auth ? "Butuh API key" : "Public"}
        </span>
      </div>
      <div className="space-y-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}
