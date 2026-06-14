import type { Metadata } from "next";
import "./globals.css";

// Render dinamis wajib agar middleware bisa menyuntik nonce CSP per-request ke
// script yang dirender Next.js. Tanpa ini halaman tersaji statis tanpa nonce.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Dashboard - TamsHub ClaudProx",
    template: "%s | Dashboard ClaudProx",
  },
  description: "Dashboard pengguna TamsHub ClaudProx — saldo token, API key, dan pembelian paket.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
  other: {
    "build-sha": process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev",
    "build-time": process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
