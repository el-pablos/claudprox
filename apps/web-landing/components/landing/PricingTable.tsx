import { PLAN_DEFINITIONS } from "@claudprox/shared";
import { LinkButton } from "../ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

const DASHBOARD_BUY_URL =
  process.env.DASHBOARD_USER_URL ?? "https://dashboard.claudprox.tams.codes";

function formatRupiah(idr: number): string {
  return `Rp${idr.toLocaleString("id-ID")}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(1)}B`;
  if (tokens >= 1_000_000) return `${tokens / 1_000_000}M`;
  return tokens.toLocaleString("id-ID");
}

export function PricingTable({ withCta = true }: { withCta?: boolean }) {
  return (
    <section id="harga" className="border-b border-ctos-border">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">Paket harga</h2>
          <p className="mt-3 text-slate-400">
            Bayar per kuota token plus durasi waktu. Konfirmasi manual via QRIS, BCA, atau VA.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_DEFINITIONS.map((plan, idx) => {
            const featured = idx === 1;
            return (
              <Card
                key={plan.name}
                className={
                  featured
                    ? "relative border-ctos-accent shadow-[0_0_30px_rgba(0,229,255,0.15)]"
                    : ""
                }
              >
                {featured ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-ctos-accent px-3 py-1 text-xs font-semibold text-ctos-bg">
                    Paling laku
                  </span>
                ) : null}
                <CardHeader>
                  <CardTitle className={featured ? "text-ctos-accent" : "text-slate-100"}>
                    {plan.name}
                  </CardTitle>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-50">
                      {formatRupiah(plan.priceIdr)}
                    </span>
                    <span className="text-sm text-slate-400">/{plan.durationDays} hari</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check /> {formatTokens(plan.tokens)} token kuota
                    </li>
                    <li className="flex items-start gap-2">
                      <Check /> {plan.durationDays} hari masa aktif
                    </li>
                    <li className="flex items-start gap-2">
                      <Check /> Rate limit {plan.rateLimitRpm} RPM
                    </li>
                    <li className="flex items-start gap-2">
                      <Check /> Semua model termasuk Opus thinking + agentic
                    </li>
                    <li className="flex items-start gap-2">
                      <Check /> SSE streaming aktif
                    </li>
                    <li className="flex items-start gap-2">
                      <Check /> API key tetap saat refill
                    </li>
                  </ul>
                  {withCta ? (
                    <div className="mt-6">
                      <LinkButton
                        href={`${DASHBOARD_BUY_URL}/buy?plan=${plan.name.toLowerCase()}`}
                        variant={featured ? "primary" : "secondary"}
                        className="w-full"
                      >
                        Beli {plan.name}
                      </LinkButton>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-slate-500">
          Pembayaran lewat QRIS, BCA, atau Virtual Account. Konfirmasi via Telegram{" "}
          <a
            href="https://t.me/ImTamaa"
            className="text-ctos-accent hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            t.me/ImTamaa
          </a>
          . Saldo masuk otomatis setelah admin approve.
        </p>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-ctos-accent" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4L8.5 12l6.8-6.7a1 1 0 0 1 1.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
