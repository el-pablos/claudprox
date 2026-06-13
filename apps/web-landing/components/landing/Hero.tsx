import { LinkButton } from "../ui/Button";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-ctos-border">
      <div className="absolute inset-0 ctos-grid opacity-40" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ctos-accent to-transparent opacity-60" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-32">
        <span className="mb-4 rounded-full border border-ctos-border bg-ctos-panel px-3 py-1 text-xs font-mono text-ctos-accent">
          v1.0 — gateway reseller proxy
        </span>
        <h1 className="ctos-glow max-w-3xl text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
          TamsHub <span className="text-ctos-accent">ClaudProx</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
          Akses semua model Claude (Haiku, Sonnet, Opus) plus model lain via proxy reseller.
          Konteks hingga 1M token, SSE streaming, harga hemat dengan paket token plus durasi.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <LinkButton href="/pricing" size="lg">
            Lihat Paket Harga
          </LinkButton>
          <LinkButton href="/docs/quick-start" size="lg" variant="secondary">
            Mulai Cepat
          </LinkButton>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 text-left sm:grid-cols-4 sm:gap-10">
          <Stat label="Model" value="52" />
          <Stat label="Konteks" value="1M token" />
          <Stat label="Latency" value="< 300s" />
          <Stat label="Streaming" value="SSE" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-2xl text-ctos-accent">{value}</div>
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}
