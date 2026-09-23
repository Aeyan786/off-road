"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

// Formatters live here (not passed in): a Server Component can't hand
// functions to this client component.
const compactGbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", notation: "compact", maximumFractionDigits: 1 });
const FORMATS = {
  currency: { value: formatPrice, tick: (n) => compactGbp.format(n) },
  number: { value: (n) => n.toLocaleString("en-GB"), tick: (n) => n.toLocaleString("en-GB") },
};

/** Clean axis maximum + ticks (0, 1, 2, 2.5, 5 × 10ⁿ steps). */
function niceScale(max, tickCount = 4) {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const rough = max / tickCount;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough);
  const top = Math.ceil(max / step) * step;
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step) };
}

/**
 * Single-series column chart (no legend — the card title names the series).
 * Thin columns rounded at the data end, square at the baseline; hairline
 * grid on clean ticks; the peak is labelled directly; hover/focus shows a
 * tooltip; a data table sits underneath for exact values.
 *
 * @param {{key, label, short, value, detail?: string}[]} data
 * @param {"currency"|"number"} [format]
 */
export default function ColumnChart({ data, format = "number", height = 240, emptyText = "No data for this period." }) {
  const { value: formatValue, tick: formatTick } = FORMATS[format] ?? FORMATS.number;
  const [active, setActive] = useState(null);
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, ticks } = niceScale(max);
  const peakIndex = max > 0 ? data.findIndex((d) => d.value === max) : -1;
  // Thin the x labels so they never collide.
  const every = data.length > 16 ? Math.ceil(data.length / 12) : 1;

  return (
    <div className="space-y-3">
      <div className="relative flex gap-2" style={{ height }}>
        {/* y axis */}
        <div className="relative w-14 shrink-0 text-right text-[11px] tabular-nums text-neutral-400">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / top) * 100}%` }}>
              {formatTick(t)}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {ticks.map((t) => (
            <div
              key={t}
              className={cn("absolute inset-x-0 h-px", t === 0 ? "bg-neutral-300" : "bg-neutral-100")}
              style={{ bottom: `${(t / top) * 100}%` }}
            />
          ))}

          {max === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">{emptyText}</p>
          ) : null}

          <div className="absolute inset-0 flex items-end">
            {data.map((d, i) => {
              const h = (d.value / top) * 100;
              return (
                <div
                  key={d.key}
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.label}: ${formatValue(d.value)}${d.detail ? `, ${d.detail}` : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="group relative flex h-full flex-1 items-end justify-center outline-none"
                >
                  {/* hover band = generous hit target */}
                  <div className={cn("absolute inset-0 rounded-sm transition-colors", active === i ? "bg-neutral-100/70" : "")} />
                  {d.value > 0 ? (
                    <div
                      className={cn("relative w-full max-w-6 rounded-t-[4px] transition-opacity", active !== null && active !== i ? "opacity-50" : "")}
                      style={{ height: `${Math.max(h, 0.8)}%`, marginInline: "1px", background: "var(--color-brand, #1B9DDB)" }}
                    />
                  ) : null}
                  {i === peakIndex && active === null ? (
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-1 text-[11px] font-semibold tabular-nums text-neutral-700"
                      style={{ bottom: `${h}%` }}
                    >
                      {formatValue(d.value)}
                    </span>
                  ) : null}
                  {active === i ? (
                    <div
                      role="tooltip"
                      className={cn(
                        "pointer-events-none absolute z-10 w-max max-w-48 -translate-y-full rounded-md border bg-white px-2.5 py-1.5 text-xs shadow-md",
                        i > data.length / 2 ? "right-1/2" : "left-1/2"
                      )}
                      style={{ bottom: `calc(${Math.min(h, 88)}% + 8px)` }}
                    >
                      <p className="font-medium text-neutral-900">{d.label}</p>
                      <p className="tabular-nums text-neutral-700">{formatValue(d.value)}</p>
                      {d.detail ? <p className="text-neutral-500">{d.detail}</p> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* x axis */}
      <div className="flex gap-2 pl-16 text-[11px] text-neutral-400">
        {data.map((d, i) => (
          <span key={d.key} className="flex-1 text-center">
            {i % every === 0 ? d.short : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
