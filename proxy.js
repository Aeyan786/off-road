import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { GUEST_CART_COOKIE, GUEST_CART_COOKIE_OPTIONS } from "@/lib/guest-cart";
import { loadAdminAccess } from "@/lib/server/adminAccess";
import { canAccessPath, firstAllowedPath } from "@/lib/admin-modules";

const PROTECTED_PREFIXES = ["/admin", "/api/admin"];
const AUTH_ONLY_PATHS = ["/login"];

/**
 * Gives every visitor a guest cart id if they don't already have one. A
 * Server Component can't set cookies during render, so this runs here —
 * the same place the Supabase session cookies are written — which also
 * means the id is present on the very first request.
 *
 * Applied to whichever response is actually returned, redirects included,
 * otherwise the Set-Cookie header would be dropped.
 */
function ensureGuestCart(request, response) {
  if (request.cookies.get(GUEST_CART_COOKIE)) return response;

  response.cookies.set(
    GUEST_CART_COOKIE,
    crypto.randomUUID(),
    GUEST_CART_COOKIE_OPTIONS
  );
  return response;
}

/**
 * Next.js proxy (formerly "middleware"). Runs on every request matched by
 * `config.matcher` below and:
 *  - issues the guest cart cookie to anyone missing one
 *  - enforces auth server-side:
 *      /admin/*      requires a signed-in Supabase session, otherwise -> /login
 *      /api/admin/*  same, but answers 401 JSON instead of redirecting
 *      /login        redirects an already-signed-in admin -> their first page
 *  - enforces admin permissions (lib/admin-modules.js): the user needs an
 *    admin_users row, and the module the path belongs to. Otherwise pages
 *    redirect to a page they can open and /api/admin answers 403.
 *
 * This is the server-side source of truth for route protection. Client-side
 * checks alone are not sufficient since they can be bypassed.
 */
export async function proxy(request) {
  const response = ensureGuestCart(request, NextResponse.next({ request }));

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthOnly = AUTH_ONLY_PATHS.includes(pathname);

  // Storefront routes only need the cookie — skip the auth round trip.
  if (!isProtected && !isAuthOnly) return response;

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

  if (isProtected && !user) {
    if (pathname.startsWith("/api/")) {
      return ensureGuestCart(
        request,
        NextResponse.json({ error: "Not authenticated." }, { status: 401 })
      );
    }
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return ensureGuestCart(request, NextResponse.redirect(redirectUrl));
  }

  // Permissions are read on every admin request, so granting or revoking a
  // module takes effect on the user's very next click.
  let access = null;
  if (user) {
    try {
      access = await loadAdminAccess(user.id);
    } catch (err) {
      console.error("[proxy] could not load admin access:", err.message);
      if (isProtected) {
        return ensureGuestCart(
          request,
          NextResponse.json({ error: "Could not check permissions." }, { status: 503 })
        );
      }
    }
  }

  if (isProtected) {
    const denied = !access
      ? "no-access"
      : !canAccessPath(access, pathname)
        ? "forbidden"
        : null;

    if (denied && pathname.startsWith("/api/")) {
      return ensureGuestCart(
        request,
        NextResponse.json({ error: "You don't have permission to do this." }, { status: 403 })
      );
    }
    if (denied === "no-access") {
      // Signed in, but not an admin user: back to the login page with a
      // message (it won't bounce back here, see the /login branch below).
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "no-access");
      return ensureGuestCart(request, NextResponse.redirect(loginUrl));
    }
    if (denied === "forbidden") {
      return ensureGuestCart(
        request,
        NextResponse.redirect(new URL(firstAllowedPath(access), request.url))
      );
    }
  }

  // Only real admin users skip the login page; anyone else can still see it
  // (and switch accounts).
  if (isAuthOnly && access) {
    return ensureGuestCart(
      request,
      NextResponse.redirect(new URL(firstAllowedPath(access), request.url))
    );
  }

  return response;
}

export const config = {
  // Everything except Next internals and static files, so the guest cart
  // cookie reaches storefront visitors too — auth work is still scoped to
  // the protected paths above.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
