import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_OPTIONS,
  countryFromHeaders,
  deviceFromUserAgent,
  isBot,
} from "@/lib/analytics/visitor";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records one storefront page view. Called by components/analytics/
 * PageViewTracker.jsx on every navigation.
 *
 * The visitor id lives in an httpOnly cookie issued here on the first view,
 * so "new" vs "returning" is decided server-side and the client can't spoof
 * it. Raw IP addresses are never stored — only the country the host's edge
 * headers report. Failures are swallowed: analytics must never break a page.
 */
export async function POST(request) {
  const userAgent = request.headers.get("user-agent");
  if (isBot(userAgent)) return NextResponse.json({ ok: true });

  let path = "/";
  try {
    const body = await request.json();
    if (typeof body?.path === "string" && body.path.startsWith("/")) {
      path = body.path.slice(0, 300);
    }
  } catch {
    // Keep the default path — a malformed body isn't worth an error page.
  }

  // Never count the admin portal as storefront traffic.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return NextResponse.json({ ok: true });
  }

  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  const isNew = !existing || !UUID.test(existing);
  const visitorId = isNew ? crypto.randomUUID() : existing;

  const response = NextResponse.json({ ok: true });
  if (isNew) response.cookies.set(VISITOR_COOKIE, visitorId, VISITOR_COOKIE_OPTIONS);

  try {
    const { error } = await createAdminClient().rpc("track_page_view", {
      p_visitor_id: visitorId,
      p_path: path,
      p_country: countryFromHeaders(request.headers),
      p_device: deviceFromUserAgent(userAgent),
      p_is_new: isNew,
    });
    if (error) console.error("track_page_view failed:", error.message);
  } catch (err) {
    console.error("track_page_view failed:", err.message);
  }

  return response;
}
