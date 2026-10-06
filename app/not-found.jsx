import { Compass } from "lucide-react";
import ErrorState from "@/components/states/ErrorState";

export const metadata = {
  title: "Page Not Found",
};

/** 404 for any URL that matches no route at all. */
export default function NotFound() {
  return (
    <ErrorState
      icon={Compass}
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      primaryLink={{ href: "/", label: "Go to homepage" }}
      secondaryLink={{ href: "/products", label: "Browse products" }}
    />
  );
}
