import type { Metadata } from "next";
import { listUserModels } from "@claudprox/shared";
import { DocsHeader } from "../../../components/docs/DocsHeader";
import { Footer } from "../../../components/landing/Footer";

export const metadata: Metadata = {
  title: "Model yang Didukung",
  description: "Daftar 52 model whitelist TamsHub ClaudProx.",
  alternates: { canonical: "/docs/models" },
};

export default function ModelsPage() {
  const all = listUserModels().sort();
  const groups = groupModels(all);

  return (
    <main>
      <DocsHeader />
      <article className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        <header>
          <a href="/docs" className="text-xs text-foreground-muted hover:text-ctos-accent">← Docs</a>
          <h1 className="mt-3 text-3xl font-bold text-foreground">Model yang Didukung</h1>
          <p className="mt-2 text-foreground-muted">
            Total {all.length} model. ID model versi user TANPA prefix kr/. Titik di versi upstream
            diganti strip — gateway nge-handle transform dua arah otomatis.
          </p>
        </header>

        <div className="rounded-lg border border-ctos-border bg-ctos-panel p-6">
          <p className="text-sm text-foreground-muted">
            Variasi suffix per model: <span className="font-mono text-ctos-accent">-thinking</span>,{" "}
            <span className="font-mono text-ctos-accent">-agentic</span>,{" "}
            <span className="font-mono text-ctos-accent">-thinking-agentic</span>.
          </p>
        </div>

        {groups.map((g) => (
          <section key={g.label}>
            <h2 className="mb-3 text-lg font-semibold text-foreground">{g.label}</h2>
            <ul className="grid gap-1 sm:grid-cols-2">
              {g.items.map((m) => (
                <li key={m} className="font-mono text-xs text-foreground-muted">
                  {m}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-sm text-foreground-muted">
          Lanjut: <a href="/docs/sse-streaming" className="text-ctos-accent hover:underline">SSE Streaming</a> →
        </p>
      </article>
      <Footer />
    </main>
  );
}

function groupModels(models: string[]): { label: string; items: string[] }[] {
  const groups: Record<string, string[]> = {};
  for (const m of models) {
    const family = familyOf(m);
    if (!groups[family]) groups[family] = [];
    groups[family]!.push(m);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, items]) => ({ label, items: items.sort() }));
}

function familyOf(model: string): string {
  if (model.startsWith("claude-opus")) return "Claude Opus";
  if (model.startsWith("claude-sonnet")) return "Claude Sonnet";
  if (model.startsWith("claude-haiku")) return "Claude Haiku";
  if (model.startsWith("deepseek")) return "DeepSeek";
  if (model.startsWith("minimax")) return "MiniMax";
  if (model.startsWith("auto")) return "Auto Routing";
  if (model.startsWith("glm")) return "GLM";
  if (model.startsWith("qwen")) return "Qwen";
  return "Lainnya";
}
