"use client";

import ErrorState from "@/components/states/ErrorState";

/** Admin error boundary — the shell, sidebar and navigation stay usable. */
export default function AdminError({ error, reset }) {
  return (
    <ErrorState
      title="This page couldn't load"
      description="Something went wrong fetching this page's data. Try again, or head back to the dashboard."
      detail={error?.digest ? "Reference: " + error.digest : undefined}
      onRetry={reset}
      primaryLink={{ href: "/admin", label: "Back to dashboard" }}
    />
  );
}
