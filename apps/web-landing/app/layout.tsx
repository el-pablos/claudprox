import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.APP_BASE_URL ?? "https://claudprox.tams.codes";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
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
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
