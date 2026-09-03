import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_PREFIXES = ["/admin", "/api/admin"];
const AUTH_ONLY_PATHS = ["/login"];

/**
 * Next.js proxy (formerly "middleware"). Runs on every request matched by
 * `config.matcher` below and enforces auth server-side:
 *  - /admin/*  requires a signed-in Supabase session, otherwise -> /login
 *  - /login    redirects an already-signed-in user -> /admin
 *
 * This is the server-side source of truth for route protection. Client-side
 * checks alone are not sufficient since they can be bypassed.
 */
export async function proxy(request) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthOnly = AUTH_ONLY_PATHS.includes(pathname);

  if (isProtected && !user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthOnly && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};
