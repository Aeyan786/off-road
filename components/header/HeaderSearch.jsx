"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/components/header/useProductSearch";
import { cn } from "@/lib/utils";

// Keep in sync with MIN_QUERY_LENGTH in app/api/search/route.js.
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

/**
 * Header search — submitting sends the keyword to /products?q=; while typing
 * it shows up to five matching products (image, name, price).
 *
 * Requests are debounced, only start at MIN_QUERY_LENGTH characters, cancel
 * the previous in-flight request, and reuse results already fetched in this
 * session, so typing doesn't hit the database on every keystroke.
 */
export default function HeaderSearch() {
  const { current, submit } = useProductSearch();
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef(null);
  const cacheRef = useRef(new Map());

  const [query, setQuery] = useState(current);
  const [syncedCurrent, setSyncedCurrent] = useState(current);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState({ term: "", products: [], error: null });
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  // Follow the URL (e.g. search cleared by the filters' Reset).
  if (current !== syncedCurrent) {
    setSyncedCurrent(current);
    setQuery(current);
  }

  const term = query.trim();
  const ready = term.length >= MIN_QUERY_LENGTH;
  // Results only count once they belong to what's in the box now.
  const shown = ready && results.term === term ? results : null;
  const products = shown?.products ?? [];

  useEffect(() => {
    if (!ready) return;

    const cached = cacheRef.current.get(term.toLowerCase());
    if (cached) {
      setResults({ term, products: cached, error: null });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?${new URLSearchParams({ q: term })}`, {
          signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Search failed.");
        cacheRef.current.set(term.toLowerCase(), body.products);
        setResults({ term, products: body.products, error: null });
      } catch (err) {
        if (err.name === "AbortError") return;
        setResults({ term, products: [], error: err.message });
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, ready]);

  // Close when clicking anywhere outside the search box.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    setHighlight(-1);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!open || products.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((i) => (i + 1) % products.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((i) => (i <= 0 ? products.length - 1 : i - 1));
    } else if (event.key === "Enter" && highlight >= 0) {
      event.preventDefault();
      close();
      router.push(`/products/${products[highlight].id}`);
    }
  }

  const showPanel = open && ready;

  return (
    <div ref={rootRef} className="relative flex flex-1">
      <form
        role="search"
        onSubmit={(event) => {
          close();
          submit(event);
        }}
        className="flex flex-1 items-stretch"
      >
        <Input
          type="search"
          name="q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlight(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
          autoComplete="off"
          className="rounded-none border-none shadow-none focus-visible:ring-0"
        />
        <Button type="submit" className="cursor-pointer gap-1.5 rounded-none rounded-r-[5px] px-5">
          <Search className="size-4" />
          Search
        </Button>
      </form>

      {showPanel ? (
        <div className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-md border bg-white text-left shadow-lg">
          {!shown || (loading && products.length === 0) ? (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-500">
              <Loader2 className="size-4 animate-spin" />
              Searching…
            </p>
          ) : shown.error ? (
            <p className="px-4 py-3 text-sm text-destructive">{shown.error}</p>
          ) : products.length === 0 ? (
            <p className="px-4 py-3 text-sm text-neutral-500">
              No products match &ldquo;{term}&rdquo;.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Product suggestions" className="divide-y">
              {products.map((product, index) => (
                <li key={product.id} id={`${listId}-${index}`} role="option" aria-selected={index === highlight}>
                  <Link
                    href={`/products/${product.id}`}
                    onClick={close}
                    onMouseEnter={() => setHighlight(index)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors",
                      index === highlight ? "bg-neutral-100" : "hover:bg-neutral-50"
                    )}
                  >
                    <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-neutral-100">
                      {product.image ? (
                        <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
                      ) : (
                        <ImageIcon className="size-4 text-neutral-300" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-neutral-900">{product.title}</span>
                      {product.subtitle ? (
                        <span className="block truncate text-xs text-neutral-500">{product.subtitle}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-neutral-900">{product.price}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {shown && !shown.error && products.length > 0 ? (
            <Link
              href={`/products?${new URLSearchParams({ q: term })}`}
              onClick={close}
              className="block cursor-pointer border-t bg-neutral-50 px-4 py-2.5 text-center text-xs font-semibold text-brand hover:bg-neutral-100"
            >
              See all results for &ldquo;{term}&rdquo;
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
