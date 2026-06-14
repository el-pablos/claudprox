import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { PricingTable } from "../components/landing/PricingTable";
import { CliGrid } from "../components/landing/CliGrid";
import { Footer } from "../components/landing/Footer";
import { LinkButton } from "../components/ui/Button";
import { LandingNav } from "../components/landing/LandingNav";

export default function HomePage() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <Features />
      <CliGrid />
      <PricingTable />
      <CallToAction />
      <Footer />
    </main>
  );
}

function CallToAction() {
  return (
    <section className="border-b border-ctos-border bg-gradient-to-b from-ctos-bg to-ctos-panel/40">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-50 sm:text-4xl">
          Siap pakai semua model premium dengan harga ramah
        </h2>
        <p className="mt-4 text-slate-400">
          Pilih paket, transfer manual, admin approve. Saldo langsung masuk ke API key kamu.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <LinkButton href="/pricing" size="lg">
            Mulai sekarang
          </LinkButton>
          <LinkButton href="/docs/quick-start" variant="secondary" size="lg">
            Baca docs dulu
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
