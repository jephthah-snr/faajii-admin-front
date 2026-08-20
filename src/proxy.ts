import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canAccessRoute, getFallbackRoute } from "@/config/access";

/**
 * Next.js 16 proxy (formerly `middleware`). Guards every dashboard route:
 * authenticates the session cookie, then defers the role check to the shared
 * access map in `@/config/access` so the sidebar and the proxy stay in sync.
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // The (auth) group is public.
  if (pathname.startsWith("/auth") || pathname === "/sign-in") {
    return NextResponse.next();
  }

  const token = req.cookies.get("faajiiAdminAuthToken")?.value;
  const tokenExpiration = req.cookies.get("faajiiAdminTokenExpiration")?.value;
  const userPermission = req.cookies.get("faajiiAdminUserPermission")?.value;

  const isExpired =
    !tokenExpiration || Date.now() > Number.parseInt(tokenExpiration, 10);

  if (!token || isExpired || !userPermission) {
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (!canAccessRoute(pathname, userPermission)) {
    return NextResponse.redirect(
      new URL(getFallbackRoute(userPermission), req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except API routes, Next internals, static assets and the
    // public auth pages.
    "/((?!api|_next|favicon.ico|fonts|images|auth|sign-in).*)",
  ],
};
