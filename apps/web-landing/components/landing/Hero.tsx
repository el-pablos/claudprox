import { LinkButton } from "../ui/Button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div className="absolute inset-0 ctos-grid opacity-40" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
      <div
        className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #673AB7, transparent)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
        <div className="text-center lg:text-left">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            v1.0 — gateway reseller proxy
          </span>
          <h1 className="ctos-glow mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            TamsHub <span className="brand-gradient-text">ClaudProx</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-foreground-muted sm:text-lg lg:mx-0 mx-auto">
            Akses model Claude premium (Haiku, Sonnet, Opus) plus model lain lewat satu gateway.
            Konteks panjang sesuai model, SSE streaming, harga hemat dengan paket token plus durasi.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-start justify-center">
            <LinkButton href="/pricing" size="lg">
              Lihat Paket Harga
            </LinkButton>
            <LinkButton href="/docs/quick-start" size="lg" variant="secondary">
              Mulai Cepat
            </LinkButton>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left sm:grid-cols-4 sm:gap-8">
            <Stat label="Model" value="52" />
            <Stat label="Konteks" value="1M token" />
            <Stat label="Timeout" value="300s" />
            <Stat label="Streaming" value="SSE" />
          </div>
        </div>

        <TerminalPanel />
      </div>
    </section>
  );
}

function TerminalPanel() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        className="absolute -inset-1 rounded-xl opacity-40 blur-lg"
        style={{ background: "linear-gradient(135deg, #FF5722, #673AB7)" }}
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-xl border border-border-strong bg-[#101010] shadow-elev-2">
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-danger/80" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-accent/80" aria-hidden="true" />
          <span className="h-3 w-3 rounded-full bg-success/80" aria-hidden="true" />
          <span className="ml-2 font-mono text-xs text-foreground-muted">request.sh</span>
        </div>
        <pre tabIndex={0} role="region" aria-label="Contoh perintah request.sh" className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
<span className="text-foreground-muted">{"# Ganti BASE_URL, langsung jalan"}</span>{"\n"}
<span className="text-secondary">curl</span>{" https://api-claudprox.tams.codes/v1/chat/completions \\\n"}
{"  -H "}<span className="text-accent">{'"Authorization: Bearer cpx_live_xxx"'}</span>{" \\\n"}
{"  -H "}<span className="text-accent">{'"Content-Type: application/json"'}</span>{" \\\n"}
{"  -d '{\n"}
{'    "model": '}<span className="text-primary">{'"claude-opus-4-5"'}</span>{",\n"}
{'    "stream": '}<span className="text-primary">true</span>{",\n"}
{'    "messages": [{ "role": "user", "content": "Halo" }]\n'}
{"  }'"}
        </pre>
        <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-mono text-success">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
            200 OK
          </span>
          <span className="font-mono text-[11px] text-foreground-muted">SSE stream · token metered</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-2xl text-primary">{value}</div>
      <div className="text-xs uppercase tracking-wider text-foreground-muted">{label}</div>
    </div>
  );
}
