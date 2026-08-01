import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const permissionRedirects: Record<string, string> = {
  support: "/dashboard",
  finance: "/dashboard",
};

const permissionRoutes: Record<string, string[]> = {
  super: ["*"],
  admin: ["*"],
  support: [
    "/dashboard",
    "/drinks",
    "/event-management",
    "/gift-shop",
    "/order-management",
    "/party-bundles",
    "/vibes",
    "/purchases",
    "/user-management",
  ],
  finance: ["/dashboard", "/transactions", "/purchases"],
};

// Middleware function
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // Check if the current route is /verify
  /*  if (pathname.startsWith("/verify")) {
    const code = req.nextUrl.searchParams.get("code");
    const activationToken = req.nextUrl.searchParams.get("token");

    // Redirect to /sign-in if code or activationToken is missing
    if (!code || !activationToken) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  } */

  // Exclude any route under the (auth) directory
  if (pathname.startsWith("/auth") || pathname === "/sign-in") {
    return NextResponse.next();
  }

  const token = req.cookies.get("faajiiAdminAuthToken")?.value;
  const tokenExpiration = req.cookies.get("faajiiAdminTokenExpiration")?.value;
  const userPermission = req.cookies.get("faajiiAdminUserPermission")?.value;

  // 1. Check authentication
  if (!token || !tokenExpiration || Date.now() > parseInt(tokenExpiration)) {
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  if (!userPermission) {
    url.pathname = "/sign-in";
    return NextResponse.redirect(url);
  }

  const allowedRoutes = permissionRoutes[userPermission] || [];

  const isAllowed =
    allowedRoutes.includes(pathname) || allowedRoutes.includes("*");

  if (!isAllowed) {
    const fallback = permissionRedirects[userPermission] || "/";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  // Continue to the requested route if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match only protected pages — exclude `(auth)` dir like `/auth/sign-in`
    "/((?!api|_next|favicon.ico|auth|sign-in).*)",
  ],
};
