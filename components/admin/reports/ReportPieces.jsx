import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { PERIODS, PERIOD_LABELS } from "@/lib/reports/period";
import { cn } from "@/lib/utils";

/**
 * Period filter shared by both reports: Day / Week / Month / Year plus
 * previous / next / today. Plain links, so every view is a shareable URL
 * and works without JavaScript.
 */
export function PeriodPicker({ basePath, period }) {
  const href = (type, date) => `${basePath}?${new URLSearchParams({ period: type, ...(date ? { date } : {}) })}`;
  const navClass =
    "flex size-8 cursor-pointer items-center justify-center rounded-sm border bg-white text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div role="tablist" aria-label="Report period" className="inline-flex w-fit rounded-md border bg-white p-0.5">
        {PERIODS.map((type) => (
          <Link
            key={type}
            role="tab"
            aria-selected={period.type === type}
            // Viewing the current period -> switch to the current day/week/
            // month/year; browsing the past -> stay anchored to that period.
            href={href(type, period.isCurrent ? null : period.anchor)}
            className={cn(
              "cursor-pointer rounded-sm px-3 py-1.5 text-xs font-medium transition-colors",
              period.type === type ? "bg-brand text-white" : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            {PERIOD_LABELS[type]}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link href={href(period.type, period.prevAnchor)} aria-label="Previous period" className={navClass}>
          <ChevronLeft className="size-4" />
        </Link>
        <p className="min-w-40 text-center text-sm font-semibold text-neutral-900" aria-live="polite">
          {period.label}
        </p>
        {period.nextAnchor ? (
          <Link href={href(period.type, period.nextAnchor)} aria-label="Next period" className={navClass}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span aria-hidden="true" className={cn(navClass, "cursor-not-allowed opacity-40 hover:bg-white")}>
            <ChevronRight className="size-4" />
          </span>
        )}
        {period.isCurrent ? null : (
          <Link href={href(period.type, period.todayAnchor)} className="cursor-pointer text-xs font-medium text-brand hover:underline">
            Today
          </Link>
        )}
      </div>
    </div>
  );
}

/** "+12% vs previous" line for stat cards; null change = no comparison. */
export function ChangeHint({ change, previousLabel }) {
  if (change === null || change === undefined) return `No sales in ${previousLabel}`;
  const pct = Math.round(Math.abs(change) * 100);
  const up = change >= 0;
  return (
    <span className="inline-flex items-center gap-0.5">
      {up ? <ArrowUpRight className="size-3 text-emerald-600" /> : <ArrowDownRight className="size-3 text-destructive" />}
      <span className={up ? "text-emerald-700" : "text-destructive"}>{pct}%</span>
      <span className="ml-1">vs {previousLabel}</span>
    </span>
  );
}

/**
 * Ranked horizontal bars (single series): name, bar, value at the bar's
 * end. Thin bars from one baseline; text stays in text colours.
 */
export function RankedBars({ rows, value, format, detail, emptyText = "Nothing to show for this period." }) {
  const max = Math.max(0, ...rows.map(value));
  if (!rows.length || max === 0) return <p className="py-6 text-center text-sm text-neutral-400">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.key ?? row.name ?? row.code} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-neutral-800" title={row.name ?? row.code}>{row.name ?? row.code}</span>
            <span className="shrink-0 tabular-nums font-medium text-neutral-900">{format(value(row))}</span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-100">
            <div className="h-1.5 rounded-full" style={{ width: `${Math.max((value(row) / max) * 100, 1)}%`, background: "var(--color-brand, #1B9DDB)" }} />
          </div>
          {detail ? <p className="text-xs text-neutral-500">{detail(row)}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/** Status colours (reserved for stock state) — always with a label and count. */
const STOCK_SEGMENTS = [
  { key: "in", label: "In stock", color: "#16A34A" },
  { key: "low", label: "Low stock", color: "#D97706" },
  { key: "out", label: "Out of stock", color: "#DC2626" },
];

export function StockStatusBar({ counts, threshold }) {
  const total = STOCK_SEGMENTS.reduce((s, seg) => s + (counts[seg.key] ?? 0), 0);
  return (
    <div className="space-y-3">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-neutral-100" role="img" aria-label={STOCK_SEGMENTS.map((s) => `${s.label}: ${counts[s.key]}`).join(", ")}>
        {total > 0
          ? STOCK_SEGMENTS.filter((s) => counts[s.key] > 0).map((seg) => (
              <div key={seg.key} style={{ width: `${(counts[seg.key] / total) * 100}%`, background: seg.color }} title={`${seg.label}: ${counts[seg.key]}`} />
            ))
          : null}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
        {STOCK_SEGMENTS.map((seg) => (
          <li key={seg.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: seg.color }} />
            {seg.label}
            {seg.key === "low" ? ` (1–${threshold})` : ""}:{" "}
            <span className="font-semibold tabular-nums text-neutral-900">{counts[seg.key]}</span>
            <span className="text-neutral-400">({total ? Math.round((counts[seg.key] / total) * 100) : 0}%)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
