import { NextResponse, type NextRequest } from "next/server";

// Pages of the admin area that work without a session.
const PUBLIC_ADMIN_PATHS = ["/yonetim/giris", "/yonetim/kurulum", "/yonetim/iki-adimli-dogrulama"];

/**
 * Optimistic check only: a request for a panel page without any session
 * cookie goes straight to sign-in. The real decision is made by the API on
 * every request (and by the panel layout, which asks the API).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hasSession = request.cookies.has("__Host-sid") || request.cookies.has("sid");

  let response: NextResponse;
  if (!isPublic && !hasSession) {
    response = NextResponse.redirect(new URL("/yonetim/giris", request.url));
  } else {
    response = NextResponse.next();
  }
  // Never index, cache or embed the admin area.
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/yonetim", "/yonetim/:path*"],
};
