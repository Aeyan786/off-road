import { SearchX } from "lucide-react";
import ErrorState from "@/components/states/ErrorState";

export const metadata = {
  title: "Not Found",
};

/**
 * Shown when an admin page calls notFound() — editing a product, blog or
 * user that no longer exists — and for unknown /admin URLs.
 */
export default function AdminNotFound() {
  return (
    <ErrorState
      icon={SearchX}
      title="Not found"
      description="This record no longer exists, or the page you asked for isn't part of the admin panel."
      primaryLink={{ href: "/admin", label: "Back to dashboard" }}
    />
  );
}
