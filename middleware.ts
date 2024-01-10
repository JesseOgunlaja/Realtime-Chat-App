import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { UserType } from "./types/UserTypes";
import { checkSignedIn } from "./utils/auth";
import { redis } from "./utils/redis";
import { isProtectedRoute } from "./utils/utils";

export async function middleware(request: NextRequest) {
  const pathname = String(request.nextUrl.pathname);
  if (
    (pathname.includes("/login") || pathname.includes("/signup")) &&
    (await checkSignedIn(request, false))
  ) {
    return NextResponse.redirect(new URL("/chats", request.url));
  }
  if (isProtectedRoute(pathname)) {
    const result = (await checkSignedIn(request, true)) as
      | {
          isSignedIn: true;
          user: UserType;
          key: UUID;
        }
      | {
          isSignedIn: false;
        };
    if (!result.isSignedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const requestHeaders = new Headers(request.headers);
    const userDetails = await redis.lrange("User details", 0, -1);

    requestHeaders.set("user", JSON.stringify(result.user));
    requestHeaders.set("key", JSON.stringify(result.key));
    requestHeaders.set("UserDetails", JSON.stringify(userDetails));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
