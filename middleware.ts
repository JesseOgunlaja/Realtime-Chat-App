import { NextRequest, NextResponse } from "next/server";
import { checkSignedIn, protectedRouteForwarder } from "./utils/auth";

export async function middleware(request: NextRequest) {
  const pathname = String(request.nextUrl.pathname);
  if (
    pathname.includes("/dashboard") &&
    (await checkSignedIn(request, false)) === false
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (
    (pathname.includes("/login") || pathname.includes("/signup")) &&
    (await checkSignedIn(request, false))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (
    pathname.includes("/api/user") ||
    pathname.includes("/api/friends") ||
    pathname.includes("/api/chat")
  ) {
    return protectedRouteForwarder(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
