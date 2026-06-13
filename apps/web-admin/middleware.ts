import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "cpx_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Login dan health endpoint terbuka.
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
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
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
