import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "cpx_admin_session";

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const nonce = btoa(crypto.randomUUID());
  const policy = buildPolicy(nonce);

  const withCsp = () => {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", policy);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy-Report-Only", policy);
    return res;
  };

  // Endpoint report tidak butuh auth dan tidak perlu CSP (response 204).
  if (pathname.startsWith("/api/csp-report")) {
    return NextResponse.next();
  }

  // Login, auth API, dan asset terbuka. Tetap pasang CSP untuk halaman login.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return withCsp();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token === undefined || token === "") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { type: "unauthenticated" } },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("Content-Security-Policy-Report-Only", policy);
    return redirect;
  }
  return withCsp();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
