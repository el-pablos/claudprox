import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Admin - TamsHub ClaudProx",
    template: "%s | Admin ClaudProx",
  },
  description: "Panel admin internal TamsHub ClaudProx.",
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
