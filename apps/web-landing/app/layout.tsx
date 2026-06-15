import type { Metadata } from "next";
import "./globals.css";
import { Manrope, JetBrains_Mono } from "next/font/google";

const fontSans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fontMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

// Render dinamis wajib agar middleware bisa menyuntik nonce CSP per-request ke
// script yang dirender Next.js. Tanpa ini halaman tersaji statis tanpa nonce.
export const dynamic = "force-dynamic";

const APP_URL = process.env.APP_BASE_URL ?? "https://claudprox.tams.codes";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "TamsHub - ClaudProx | Akses Semua Model Claude Murah",
    template: "%s | TamsHub ClaudProx",
  },
  description:
    "TamsHub Claude Proxy: akses semua model Claude (Haiku, Sonnet, Opus) plus model lain, dukungan konteks hingga 1M token dan SSE streaming. Pakai semua model premium dengan harga hemat.",
  keywords: [
    "claude proxy",
    "ai gateway",
    "openai compatible",
    "anthropic compatible",
    "claude opus",
    "sse streaming",
    "tamshub",
    "claudprox",
  ],
  authors: [{ name: "el-pablos", url: "https://github.com/el-pablos" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: APP_URL,
    siteName: "TamsHub ClaudProx",
    title: "TamsHub - ClaudProx | Akses Semua Model Claude Murah",
    description:
      "Akses semua model Claude plus model lain via proxy reseller dengan metering token, SSE streaming, dan harga hemat.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TamsHub - ClaudProx",
    description:
      "Akses semua model Claude plus model lain via proxy reseller dengan metering token dan SSE streaming.",
  },
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "build-sha": process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev",
    "build-time": process.env.NEXT_PUBLIC_BUILD_TIME ?? "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
