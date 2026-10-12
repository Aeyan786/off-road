"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RotateCcw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LABEL_CLASS = "block text-xs font-medium text-neutral-600";
const FIELD_CLASS = "h-9 w-full";
const SELECT_CLASS =
  "h-9 w-full cursor-pointer rounded-md border border-neutral-300 bg-white px-2 text-sm text-neutral-800 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/**
 * Search, sort and date filters for the blog index.
 *
 * Rendered by the page outside the results' Suspense boundary, so it stays
 * mounted (and the search box keeps focus) while results reload. Every
 * filter lives in the URL, so they combine rather than overriding each
 * other, results are shareable and the back button works — the same
 * approach the product catalogue filters use.
 */
export default function BlogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlSearch = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(urlSearch);
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);

  // Keep the box in step when the URL changes from elsewhere (reset, back).
  if (urlSearch !== syncedSearch) {
    setSyncedSearch(urlSearch);
    setSearch(urlSearch);
  }

  const sort = searchParams.get("sort") === "oldest" ? "oldest" : "newest";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilters = Boolean(urlSearch || searchParams.get("sort") || from || to);

  function apply(updates) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `/blogs?${query}` : "/blogs", { scroll: false });
    });
  }

  // The search box is typed rather than picked, so debounce it.
  useEffect(() => {
    if (search === urlSearch) return;
    const timeout = setTimeout(() => apply({ q: search }), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function reset() {
    setSearch("");
    startTransition(() => router.replace("/blogs", { scroll: false }));
  }

  return (
    <div className="mb-8 rounded-sm border bg-neutral-50 p-4">
      {/* Every field has a visible label above it, so the inputs share one
          baseline; the reset action sits in the same row on wide screens. */}
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label htmlFor="blog-search" className={LABEL_CLASS}>
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="blog-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title..."
              className={`${FIELD_CLASS} pl-8 pr-8`}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="blog-sort" className={LABEL_CLASS}>
            Sort by
          </label>
          <select
            id="blog-sort"
            value={sort}
            onChange={(event) => apply({ sort: event.target.value === "oldest" ? "oldest" : "" })}
            className={SELECT_CLASS}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="blog-from" className={LABEL_CLASS}>
            Published from
          </label>
          <Input
            id="blog-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => apply({ from: event.target.value })}
            className={`${FIELD_CLASS} cursor-pointer`}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="blog-to" className={LABEL_CLASS}>
            Published to
          </label>
          <Input
            id="blog-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => apply({ to: event.target.value })}
            className={`${FIELD_CLASS} cursor-pointer`}
          />
        </div>

        <div className="flex h-9 items-center justify-end gap-2 sm:col-span-2 lg:col-span-1">
          {isPending ? (
            <span className="flex items-center gap-1.5 text-xs text-neutral-500" role="status">
              <Loader2 className="size-3.5 animate-spin" />
              Updating…
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            disabled={!hasFilters}
            className="cursor-pointer rounded-sm px-3 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
