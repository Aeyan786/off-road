"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MULTI_FILTER_KEYS,
  toValueList,
} from "@/lib/catalog-filters";
import { cn } from "@/lib/utils";

/** { supplier: [...], manufacturer: [...], ... } from the URL. */
function readSelection(searchParams) {
  return Object.fromEntries(
    MULTI_FILTER_KEYS.map((key) => [
      key,
      toValueList(searchParams.getAll(key)),
    ])
  );
}

/**
 * One checkbox filter.
 * Each filter group can be independently opened/closed.
 */
function FilterCheckboxGroup({
  name,
  label,
  options,
  selected,
  onToggle,
  onClear,
}) {
  const [open, setOpen] = useState(false);

  const values = [
    ...options,
    ...selected.filter((v) => !options.includes(v)),
  ];

  const headingId = `filter-${name}`;
  const contentId = `${headingId}-content`;

  return (
    <div role="group" aria-labelledby={headingId}>
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 py-1 text-left"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span
          id={headingId}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-600"
        >
          {label}

          {selected.length > 0 ? (
            <span className="rounded-full bg-brand px-1.5 py-px text-[10px] font-semibold leading-4 text-white">
              {selected.length}
            </span>
          ) : null}
        </span>

        <span className="flex items-center gap-2">
          {selected.length > 0 ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onClear();
                }
              }}
              className="cursor-pointer text-xs font-normal text-brand hover:underline"
            >
              Clear
            </span>
          ) : null}

          {open ? (
            <ChevronUp className="size-4 text-neutral-500" />
          ) : (
            <ChevronDown className="size-4 text-neutral-500" />
          )}
        </span>
      </button>

      {/* Accordion content */}
      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-0.5 bg-white p-1 pt-2">
            {values.length === 0 ? (
              <p className="px-1.5 py-1 text-xs text-neutral-400">
                No options
              </p>
            ) : (
              values.map((value) => {
                const checked = selected.includes(value);

                return (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-sm px-1.5 py-1.5 text-sm transition-colors hover:bg-neutral-50",
                      checked
                        ? "font-medium text-neutral-900"
                        : "text-neutral-700"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        onToggle(value, next)
                      }
                      className="cursor-pointer"
                    />

                    <span className="min-w-0 break-words">
                      {value}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Price range accordion.
 */
function PriceRangeFilter({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  facets,
}) {
  const [open, setOpen] = useState(true);

  const hasPrice = minPrice !== "" || maxPrice !== "";

  return (
    <div>
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 py-1 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600">
          Price range

          {hasPrice ? (
            <span className="rounded-full bg-brand px-1.5 py-px text-[10px] font-semibold leading-4 text-white">
              1
            </span>
          ) : null}
        </span>

        {open ? (
          <ChevronUp className="size-4 text-neutral-500" />
        ) : (
          <ChevronDown className="size-4 text-neutral-500" />
        )}
      </button>

      {/* Accordion content */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex items-center gap-2 pt-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(event.target.value)
              }
              placeholder={`Min £${facets.minPrice}`}
              className="h-9 text-sm"
              aria-label="Minimum price"
            />

            <span className="text-xs text-neutral-400">
              –
            </span>

            <Input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(event.target.value)
              }
              placeholder={`Max £${facets.maxPrice}`}
              className="h-9 text-sm"
              aria-label="Maximum price"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Storefront product filters.
 *
 * Every filter lives in the URL, so:
 * - results are shareable
 * - browser back button works
 * - category links can combine with other filters
 * - multiple checkbox values can be active simultaneously
 */
export default function ProductFilters({
  facets,
  activeCategory,
  basePath = "/products",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(
    searchParams.get("min") ?? ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max") ?? ""
  );

  const [isPending, startTransition] = useTransition();

  /*
   * Each filter change is a server round trip, so searchParams
   * can temporarily contain the previous value while a request
   * is in flight.
   *
   * This ref ensures quick filter changes don't overwrite each
   * other.
   */
  const pendingParams = useRef(
    new URLSearchParams(searchParams.toString())
  );

  useEffect(() => {
    pendingParams.current = new URLSearchParams(
      searchParams.toString()
    );
  }, [searchParams]);

  /*
   * Ticked checkboxes are shown immediately while results reload.
   */
  const paramsKey = searchParams.toString();

  const [selection, setSelection] = useState(() =>
    readSelection(searchParams)
  );

  const [syncedKey, setSyncedKey] = useState(paramsKey);

  if (paramsKey !== syncedKey) {
    setSyncedKey(paramsKey);
    setSelection(readSelection(searchParams));
  }

  function navigate() {
    const query = pendingParams.current.toString();

    startTransition(() => {
      router.replace(
        query ? `${basePath}?${query}` : basePath,
        {
          scroll: false,
        }
      );
    });
  }

  function apply(updates) {
    const params = pendingParams.current;

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    navigate();
  }

  /**
   * Replaces every value of a checkbox filter with `values`.
   */
  function setValues(name, values) {
    setSelection((previous) => ({
      ...previous,
      [name]: values,
    }));

    const params = pendingParams.current;

    params.delete(name);

    for (const value of values) {
      params.append(name, value);
    }

    navigate();
  }

  function toggle(name, value, checked) {
    const current = toValueList(
      pendingParams.current.getAll(name)
    );

    setValues(
      name,
      checked
        ? [...new Set([...current, value])]
        : current.filter((v) => v !== value)
    );
  }

  /*
   * Price is typed rather than picked, so debounce it.
   */
  useEffect(() => {
    const current = searchParams.get("min") ?? "";
    const currentMax = searchParams.get("max") ?? "";

    if (
      minPrice === current &&
      maxPrice === currentMax
    ) {
      return;
    }

    const timeout = setTimeout(() => {
      apply({
        min: minPrice,
        max: maxPrice,
      });
    }, 400);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPrice, maxPrice]);

  const searchTerm = searchParams.get("q")?.trim();

  const hasFilters = [
    "q",
    "category",
    "supplier",
    "manufacturer",
    "model",
    "year",
    "min",
    "max",
  ].some((key) => searchParams.get(key));

  return (
    <aside className="max-h-200 space-y-5 px-5 overflow-y-auto">
      {/* HEADER */}
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
              setSelection(
                readSelection(new URLSearchParams())
              );

              pendingParams.current =
                new URLSearchParams();

              startTransition(() => {
                router.replace(basePath, {
                  scroll: false,
                });
              });
            }}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </div>

      {/* SEARCH */}
      {searchTerm ? (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-600">
            Search
          </span>

          <span className="flex items-center justify-between gap-2 rounded-sm border bg-white px-2 py-1.5 text-sm text-neutral-800">
            <span className="truncate">
              &ldquo;{searchTerm}&rdquo;
            </span>

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

      {/* CATEGORY */}
      {activeCategory ? (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-neutral-600">
            Category
          </span>

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

      {/* SUPPLIER */}
      <FilterCheckboxGroup
        name="supplier"
        label="Supplier"
        options={facets.suppliers}
        selected={selection.supplier}
        onToggle={(value, checked) =>
          toggle("supplier", value, checked)
        }
        onClear={() => setValues("supplier", [])}
      />

      {/* MANUFACTURER */}
      <FilterCheckboxGroup
        name="manufacturer"
        label="Manufacturer"
        options={facets.manufacturers}
        selected={selection.manufacturer}
        onToggle={(value, checked) =>
          toggle("manufacturer", value, checked)
        }
        onClear={() => setValues("manufacturer", [])}
      />

      {/* MODEL */}
      <FilterCheckboxGroup
        name="model"
        label="Model"
        options={facets.models}
        selected={selection.model}
        onToggle={(value, checked) =>
          toggle("model", value, checked)
        }
        onClear={() => setValues("model", [])}
      />

      {/* YEAR */}
      <FilterCheckboxGroup
        name="year"
        label="Year"
        options={facets.years}
        selected={selection.year}
        onToggle={(value, checked) =>
          toggle("year", value, checked)
        }
        onClear={() => setValues("year", [])}
      />

      {/* PRICE RANGE */}
      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        facets={facets}
      />
    </aside>
  );
}
