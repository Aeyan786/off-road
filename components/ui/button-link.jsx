import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A Next.js Link styled to look like a Button. Base UI's Button primitive
 * enforces button semantics (role="button", keyboard handling) and its own
 * docs advise against rendering an `<a>` through it — for a link that
 * should look like a button, style the anchor directly instead.
 * https://base-ui.com/react/components/button#rendering-links-as-buttons
 */
export default function ButtonLink({
  href,
  variant,
  size,
  className,
  ...props
}) {
  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
