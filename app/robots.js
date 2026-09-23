import { siteUrl } from "@/lib/site";

/** /robots.txt — public storefront crawlable, admin and private routes not. */
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/login", "/checkout", "/checkout/"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
