import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "cpx_session";

// Policy CSP nonce-based. Nonce per-request disuntik ke request header agar
// Next.js menambahkan atribut nonce ke script yang ia render. Fase awal memakai
// Report-Only supaya tidak memblokir resource sah saat triase.
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

function isAuthPage(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/signup");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const nonce = btoa(crypto.randomUUID());
  const policy = buildPolicy(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  // Auth gating tetap berlaku untuk route selain halaman auth. CSP dipasang di
  // semua response (termasuk redirect) agar login page juga ter-cover.
  if (!isAuthPage(pathname)) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (token === undefined || token === "") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      const redirect = NextResponse.redirect(loginUrl);
      redirect.headers.set("Content-Security-Policy", policy);
      return redirect;
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", policy);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon|og-image|.*\\..*).*)"],
};
