import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";

/**
 * Shared presentation for every error boundary and 404 page, so the
 * storefront and the admin panel report trouble the same way. The route's
 * own error.jsx stays a thin client wrapper that supplies the copy and the
 * `reset` handler.
 *
 * @param {React.ComponentType} [icon] lucide icon
 * @param {string} title
 * @param {string} description
 * @param {string} [detail] technical line, shown small and muted
 * @param {() => void} [onRetry] renders a Try again button when given
 * @param {{href: string, label: string}} [primaryLink]
 * @param {{href: string, label: string}} [secondaryLink]
 */
export default function ErrorState({
  icon: Icon = AlertTriangle,
  title,
  description,
  detail,
  onRetry,
  primaryLink,
  secondaryLink,
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="size-6 text-neutral-500" />
      </span>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
      </div>

      {detail ? (
        <p className="max-w-full truncate rounded-sm border bg-neutral-50 px-3 py-1.5 text-xs text-neutral-400">
          {detail}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button type="button" onClick={onRetry} className="cursor-pointer rounded-sm px-4">
            <RotateCcw className="size-4" />
            Try again
          </Button>
        ) : null}

        {primaryLink ? (
          <ButtonLink
            href={primaryLink.href}
            variant={onRetry ? "outline" : "default"}
            className="cursor-pointer"
          >
            {primaryLink.label}
          </ButtonLink>
        ) : null}

        {secondaryLink ? (
          <ButtonLink href={secondaryLink.href} variant="outline" className="cursor-pointer">
            {secondaryLink.label}
          </ButtonLink>
        ) : null}
      </div>
    </div>
  );
}
