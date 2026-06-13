import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "cpx_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = pathname.startsWith("/(dash)") ||
    pathname === "/" ||
    pathname.startsWith("/keys") ||
    pathname.startsWith("/buy");

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token === undefined || token === "") {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next|favicon|og-image|.*\\..*).*)"],
};
