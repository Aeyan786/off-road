import { CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared notice styles for the policy and service pages, so every warning
 * on the site looks the same instead of each page inventing its own.
 *
 *   tone="warning"  amber box, exclamation icon — estimates, caveats
 *   tone="danger"   red box, exclamation icon — hard limits
 *
 * Use WarningList for the bulleted variants: amber lines are prefixed with
 * an exclamation icon, red lines with a red X, matching the client's
 * "! -" and "X -" markers.
 */

const TONES = {
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-500",
    heading: "text-amber-900",
  },
  danger: {
    box: "border-destructive/30 bg-destructive/5 text-destructive",
    icon: "text-destructive",
    heading: "text-destructive",
  },
};

export default function WarningBox({
  tone = "warning",
  title,
  children,
  className,
}) {
  const styles = TONES[tone] ?? TONES.warning;

  return (
    <div
      role="note"
      className={cn("flex items-start gap-3 rounded-sm border px-4 py-3.5", styles.box, className)}
    >
      <CircleAlert className={cn("mt-0.5 size-5 shrink-0", styles.icon)} aria-hidden="true" />

      <div className="min-w-0 space-y-2 text-sm leading-relaxed">
        {title ? <p className={cn("font-semibold", styles.heading)}>{title}</p> : null}
        {children}
      </div>
    </div>
  );
}

/**
 * A list of conditions inside a WarningBox. Each item carries its own
 * marker: an exclamation for amber, a red X for danger.
 *
 * @param {string[]} items
 */
export function WarningList({ tone = "warning", items = [], className }) {
  const styles = TONES[tone] ?? TONES.warning;
  const Marker = tone === "danger" ? X :  CircleAlert;

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <Marker className={cn("mt-0.5 size-4 shrink-0", styles.icon)} aria-hidden="true" />
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}
