import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/Card";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "OpenAI sama Anthropic compatible",
    description:
      "Endpoint /v1/chat/completions sama /v1/messages. Ganti BASE_URL doang, tool kamu langsung jalan.",
    icon: <BoltIcon />,
  },
  {
    title: "SSE streaming pasif penuh",
    description:
      "Gateway nge-pipe stream Server-Sent Events tanpa buffering. Token muncul real-time persis kayak ke upstream.",
    icon: <StreamIcon />,
  },
  {
    title: "Metering token akurat",
    description:
      "Hitung token dari usage upstream (bukan estimasi buta). Saldo decrement atomik, ga akan minus.",
    icon: <MeterIcon />,
  },
  {
    title: "Konteks 1M token",
    description:
      "Dukungan model konteks panjang untuk codebase besar, dokumen panjang, sama agentic flow yang riweuh.",
    icon: <ContextIcon />,
  },
  {
    title: "Rate limit per paket",
    description:
      "Tiap paket punya batas RPM masing-masing supaya request kamu ga ke-throttle sama tetangga.",
    icon: <ShieldIcon />,
  },
  {
    title: "Refill mulus",
    description:
      "Token habis lalu beli paket lagi: API key sama akun tetap. Saldo nambah otomatis setelah admin approve.",
    icon: <RefillIcon />,
  },
];

export function Features() {
  return (
    <section id="fitur" className="border-b border-ctos-border bg-ctos-bg/40">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Kenapa pakai ClaudProx
          </h2>
          <p className="mt-3 max-w-2xl text-foreground-muted mx-auto">
            Gateway reseller fokus ke akses model premium dengan harga ramah, bukan janji marketing.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="hover:border-ctos-accent transition-colors">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md bg-ctos-bg text-ctos-accent">
                  {f.icon}
                </div>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" strokeLinejoin="round" />
    </svg>
  );
}
function StreamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path d="M3 12h6M3 6h12M3 18h9M15 9l3 3-3 3" strokeLinecap="round" />
    </svg>
  );
}
function MeterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path d="M12 2v3M3.5 12H6m12 0h2.5M5 19l1.7-1.7M17.3 17.3L19 19" />
      <circle cx="12" cy="14" r="6" />
      <path d="M12 14l3-3" strokeLinecap="round" />
    </svg>
  );
}
function ContextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h10M7 16h6" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path d="M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7z" strokeLinejoin="round" />
    </svg>
  );
}
function RefillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
