import { NextResponse, type NextRequest } from "next/server";

// CSP nonce-based untuk landing. Nonce di-generate per-request, disuntik ke
// request header agar Next.js menambahkan atribut nonce ke seluruh script yang
// ia render (bootstrap RSC + chunk). Fase awal memakai Report-Only supaya tidak
// memblokir resource sah saat triase violation.
function buildPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api-claudprox.tams.codes https://dashboard-claudprox.tams.codes https://admin-claudprox.tams.codes",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "report-uri /api/csp-report",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const policy = buildPolicy(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  // Nama enforcing pada request header memicu Next.js menyuntik nonce ke script.
  requestHeaders.set("Content-Security-Policy", policy);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  // Policy di-enforce setelah triase Report-Only bersih di seluruh route.
  res.headers.set("Content-Security-Policy", policy);
  return res;
}

export const config = {
  matcher: [
    // Semua route HTML kecuali aset statis, image optimizer, favicon, og-image,
    // dan endpoint report itu sendiri.
    "/((?!_next/static|_next/image|favicon|og-image|api/csp-report|.*\\..*).*)",
  ],
};
