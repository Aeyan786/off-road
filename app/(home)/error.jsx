"use client";

import ErrorState from "@/components/states/ErrorState";

/** Storefront error boundary — the header, footer and cart stay in place. */
export default function StorefrontError({ error, reset }) {
  return (
    <ErrorState
      title="Something went wrong"
      description="We couldn't load this page just now. Your cart is safe — try again, or carry on browsing."
      detail={error?.digest ? "Reference: " + error.digest : undefined}
      onRetry={reset}
      primaryLink={{ href: "/products", label: "Browse products" }}
    />
  );
}
