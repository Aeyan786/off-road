"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Pings /api/track once per storefront page view. Everything that
 * identifies the visitor (the cookie, the country, new vs returning) is
 * decided on the server — this only reports which path was viewed.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef(null);

  useEffect(() => {
    // Guards React's double-effect in development and any re-render that
    // doesn't actually change the page.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    const controller = new AbortController();
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Analytics is best-effort; a failed ping is not the visitor's problem.
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
