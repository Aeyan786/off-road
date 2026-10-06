"use client";

import ErrorState from "@/components/states/ErrorState";

/**
 * Catches render errors in routes with no closer boundary (e.g. /login).
 * The storefront and the admin panel have their own.
 */
export default function RootError({ error, reset }) {
  return (
    <ErrorState
      title="Something went wrong"
      description="We hit an unexpected problem loading this page. Trying again usually clears it."
      detail={error?.digest ? "Reference: " + error.digest : undefined}
      onRetry={reset}
      primaryLink={{ href: "/", label: "Go to homepage" }}
    />
  );
}
