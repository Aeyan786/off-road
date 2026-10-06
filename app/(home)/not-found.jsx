import { Compass } from "lucide-react";
import ErrorState from "@/components/states/ErrorState";

export const metadata = {
  title: "Not Found",
};

/**
 * Shown when a storefront page calls notFound() — an unknown product id or
 * blog slug — so the header, footer and cart stay available.
 */
export default function StorefrontNotFound() {
  return (
    <ErrorState
      icon={Compass}
      title="We couldn't find that"
      description="This product or page is no longer available. It may have sold out or been removed."
      primaryLink={{ href: "/products", label: "Browse products" }}
      secondaryLink={{ href: "/", label: "Go to homepage" }}
    />
  );
}
