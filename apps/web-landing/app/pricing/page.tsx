import type { Metadata } from "next";
import { PricingTable } from "../../components/landing/PricingTable";
import { Footer } from "../../components/landing/Footer";

export const metadata: Metadata = {
  title: "Paket Harga",
  description:
    "Pilih paket TamsHub ClaudProx: Starter, Pro, atau Ultra. Token plus durasi, refill mulus, API key tetap.",
};

export default function PricingPage() {
  return (
    <main>
      <header className="border-b border-ctos-border bg-ctos-bg">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <a href="/" className="text-xs text-foreground-muted hover:text-ctos-accent">
            ← Beranda
          </a>
          <h1 className="mt-4 text-4xl font-bold text-foreground">Paket harga</h1>
          <p className="mt-2 max-w-2xl text-foreground-muted">
            Bayar per kuota token plus durasi waktu. Refill nambah saldo, API key tetap.
          </p>
        </div>
      </header>
      <PricingTable />
      <Footer />
    </main>
  );
}
