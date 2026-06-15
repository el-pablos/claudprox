"use client";

import * as React from "react";
import { CLI_TOOLS, type CliTool } from "../../lib/cli-tools";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/Card";
import { Dialog, CodeBlock } from "../ui/Dialog";

export function CliGrid() {
  const [active, setActive] = React.useState<CliTool | null>(null);

  return (
    <section id="cli" className="border-b border-ctos-border bg-ctos-bg/40">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            18 CLI tool siap konek
          </h2>
          <p className="mt-3 text-foreground-muted">
            Klik tiap kartu untuk lihat env var nyata dan contoh perintah lengkap.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CLI_TOOLS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActive(tool)}
              className="text-left"
            >
              <Card className="h-full hover:border-ctos-accent cursor-pointer transition">
                <CardHeader className="mb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ctos-border bg-ctos-bg font-mono text-sm font-bold text-ctos-accent">
                      {tool.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.summary}</CardDescription>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Tag>{tool.category}</Tag>
                    {tool.customBaseUrlSupported ? (
                      <Tag tone="ok">Custom URL</Tag>
                    ) : (
                      <Tag tone="warn">No custom URL</Tag>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onClose={() => setActive(null)} title={active?.name ?? ""}>
        {active ? <ToolDetail tool={active} /> : null}
      </Dialog>
    </section>
  );
}

function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  const cls =
    tone === "ok"
      ? "border-ctos-accent/40 text-ctos-accent"
      : tone === "warn"
        ? "border-ctos-warn/40 text-ctos-warn"
        : "border-ctos-border text-foreground-muted";
  return (
    <span className={`rounded border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

function ToolDetail({ tool }: { tool: CliTool }) {
  return (
    <div className="space-y-4 text-sm text-foreground-muted">
      <p>{tool.summary}</p>

      {tool.envVars.length ? (
        <div>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-foreground-muted">Env var</h3>
          <ul className="space-y-1 text-xs font-mono text-foreground-muted">
            {tool.envVars.map((v) => (
              <li key={v.name}>
                <span className="text-ctos-accent">{v.name}</span>
                <span className="text-foreground-muted"> = </span>
                <span>{v.example}</span>
                {v.description ? (
                  <div className="ml-3 mt-0.5 text-[10px] text-foreground-muted">{v.description}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="mb-2 text-xs uppercase tracking-wider text-foreground-muted">Contoh perintah</h3>
        <CodeBlock code={tool.example} />
      </div>

      {tool.notes ? (
        <div className="rounded-md border border-ctos-warn/30 bg-ctos-warn/5 p-3 text-xs text-ctos-warn">
          <strong>Catatan:</strong> {tool.notes}
        </div>
      ) : null}
    </div>
  );
}
