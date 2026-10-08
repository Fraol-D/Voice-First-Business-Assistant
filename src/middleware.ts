import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function isSafeRedirectPath(path: string | null): boolean {
  if (!path) return false;
  // Must be a relative path, prevent protocol-relative URLs (//) and carriage returns
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { response, user, isConfigured } = await updateSession(request);

  const isProtectedPath =
    pathname.startsWith("/assistant") || pathname.startsWith("/dashboard");
  const isAuthPath = pathname === "/login" || pathname === "/signup";

  // 1. Unauthenticated user attempting to access protected area
  if (isProtectedPath && !user) {
    if (!isConfigured) {
      return response;
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve requested destination in next query param
    const destination = pathname + search;
    loginUrl.searchParams.set("next", destination);

    const redirectResponse = NextResponse.redirect(loginUrl);
    // Copy any updated session cookies to the redirect response
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  // 2. Authenticated user attempting to access /login or /signup
  if (isAuthPath && user) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const target = isSafeRedirectPath(nextParam) ? nextParam! : "/assistant";
    const redirectUrl = new URL(target, request.nextUrl.origin);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest
     * - public asset extensions (svg, png, jpg, jpeg, gif, webp, woff, woff2, ttf, html, js)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|html|js)$).*)",
  ],
};
