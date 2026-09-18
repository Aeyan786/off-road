"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RotateCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SELECT_CLASS =
  "h-9 w-full rounded-sm border border-neutral-300 bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Storefront product filters. Every filter lives in the URL, so results are
 * shareable, the back button works, and category links from the Shop menu
 * (?category=slug) combine with the rest without any extra wiring.
 */
export default function ProductFilters({ facets, activeCategory, basePath = "/products" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");
  const [isPending, startTransition] = useTransition();

  // Each filter change is a server round trip, so `searchParams` still holds
  // the previous value while one is in flight. Building the next URL from
  // this ref instead means changing two filters quickly can't drop the first.
  const pendingParams = useRef(new URLSearchParams(searchParams.toString()));
  useEffect(() => {
    pendingParams.current = new URLSearchParams(searchParams.toString());
  }, [searchParams]);

  function apply(updates) {
    const params = pendingParams.current;
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
    });
  }

  // Price is typed rather than picked, so it's debounced like the admin search.
  useEffect(() => {
    const current = searchParams.get("min") ?? "";
    const currentMax = searchParams.get("max") ?? "";
    if (minPrice === current && maxPrice === currentMax) return;

    const timeout = setTimeout(() => apply({ min: minPrice, max: maxPrice }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  const select = (name, label, options) => (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-neutral-600">{label}</span>
      <select
        value={searchParams.get(name) ?? ""}
        onChange={(event) => apply({ [name]: event.target.value })}
        className={`${SELECT_CLASS} cursor-pointer`}
        aria-label={label}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );

  const searchTerm = searchParams.get("q")?.trim();

  const hasFilters =
    ["q", "category", "supplier", "manufacturer", "model", "year", "min", "max"].some((key) =>
      searchParams.get(key)
    );

  return (
    <aside className="space-y-5 rounded-sm border bg-neutral-50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-900">
          Filters
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin text-neutral-400" />
          ) : null}
        </h2>
        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer rounded-sm px-3 text-xs"
            onClick={() => {
              setMinPrice("");
              setMaxPrice("");
              pendingParams.current = new URLSearchParams();
              startTransition(() => router.replace(basePath, { scroll: false }));
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </div>

      {searchTerm ? (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-600">Search</span>
          <span className="flex items-center justify-between gap-2 rounded-sm border bg-white px-2 py-1.5 text-sm text-neutral-800">
            <span className="truncate">&ldquo;{searchTerm}&rdquo;</span>
            <button
              type="button"
              onClick={() => apply({ q: "" })}
              aria-label="Clear search"
              className="cursor-pointer text-neutral-400 hover:text-neutral-700"
            >
              <X className="size-3.5" />
            </button>
          </span>
        </div>
      ) : null}

      {activeCategory ? (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-600">Category</span>
          <span className="flex items-center justify-between gap-2 rounded-sm border bg-white px-2 py-1.5 text-sm text-neutral-800">
            {activeCategory.name}
            <button
              type="button"
              onClick={() => apply({ category: "" })}
              aria-label="Clear category filter"
              className="cursor-pointer text-neutral-400 hover:text-neutral-700"
            >
              <X className="size-3.5" />
            </button>
          </span>
        </div>
      ) : null}

      {select("supplier", "Supplier", facets.suppliers)}
      {select("manufacturer", "Manufacturer", facets.manufacturers)}
      {select("model", "Model", facets.models)}
      {select("year", "Year", facets.years)}

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-neutral-600">Price range</span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder={`Min £${facets.minPrice}`}
            className="h-9 text-sm"
            aria-label="Minimum price"
          />
          <span className="text-xs text-neutral-400">–</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder={`Max £${facets.maxPrice}`}
            className="h-9 text-sm"
            aria-label="Maximum price"
          />
        </div>
      </div>
    </aside>
  );
}
