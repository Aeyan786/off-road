/**
 * Public site URL for canonical links, robots.txt and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://offroadperformance.co.uk);
 * falls back to the Vercel deployment URL, then localhost.
 */
export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const STORE_NAME = "Off Road Performance";
