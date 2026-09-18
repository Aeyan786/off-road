"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Shared behaviour for the header search boxes (desktop bar and the
 * full-width row shown below lg). Submitting always opens the catalog with just `?q=`; an empty or
 * whitespace-only search opens the unfiltered catalog instead.
 *
 * `current` is the active search when already on /products, so the box
 * keeps showing what the results are for.
 */
export function useProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = pathname === "/products" ? searchParams.get("q") ?? "" : "";

  function submit(event) {
    event.preventDefault();
    const term = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(term ? `/products?${new URLSearchParams({ q: term })}` : "/products");
  }

  return { current, submit };
}
