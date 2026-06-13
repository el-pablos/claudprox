import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dashboard - TamsHub ClaudProx",
    template: "%s | Dashboard ClaudProx",
  },
  description: "Dashboard pengguna TamsHub ClaudProx — saldo token, API key, dan pembelian paket.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
