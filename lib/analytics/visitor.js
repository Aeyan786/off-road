/**
 * Anonymous visitor identity for the storefront analytics.
 *
 * A random id in a first-party cookie — no IP address is ever stored. The
 * country comes from the edge headers the host adds (Vercel/Cloudflare),
 * which are derived from the IP upstream; we keep only the country code.
 */
export const VISITOR_COOKIE = "vx_visitor";

export const VISITOR_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365, // one year
};

/** Matches the `device` check constraint on visitors/page_views. */
export const DEVICES = ["mobile", "tablet", "desktop"];

/** Crude but adequate device split from the user agent. */
export function deviceFromUserAgent(userAgent) {
  const ua = String(userAgent ?? "").toLowerCase();
  if (/ipad|tablet|playbook|silk|kindle|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone|opera mini/.test(ua)) return "mobile";
  return "desktop";
}

/** Bots shouldn't count as visitors. */
export function isBot(userAgent) {
  return /bot|crawler|spider|crawling|slurp|bingpreview|headlesschrome|lighthouse|monitor|preview/i.test(
    String(userAgent ?? "")
  );
}

/** Two-letter country code from the host's geo headers, or null. */
export function countryFromHeaders(headers) {
  const code =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code");
  return /^[A-Za-z]{2}$/.test(code ?? "") ? code.toUpperCase() : null;
}
