"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MAX_NAV_SUBCATEGORIES } from "@/components/header/nav-links";
import { cn } from "@/lib/utils";

// Grace period so a diagonal mouse move from the trigger into the panel
// doesn't close the menu mid-travel.
const CLOSE_DELAY_MS = 140;

const categoryHref = (category) => `/products?category=${category.slug}`;

/**
 * One row in a drill-down column. A category with children selects that
 * column level on hover, focus or tap; the label itself always stays a link
 * to the category, so a touch user can either drill in with the chevron or
 * open the category directly.
 */
function DrillRow({ category, selected, hasChildren, onSelect }) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-sm transition-colors",
          selected ? "bg-brand/5" : "hover:bg-neutral-50"
        )}
        onMouseEnter={hasChildren ? onSelect : undefined}
      >
        <Link
          href={categoryHref(category)}
          onFocus={hasChildren ? onSelect : undefined}
          className={cn(
            "min-w-0 flex-1 cursor-pointer truncate px-2.5 py-2 text-sm transition-colors",
            selected ? "font-medium text-brand" : "text-neutral-700 hover:text-brand"
          )}
        >
          {category.name}
        </Link>

        {hasChildren ? (
          <button
            type="button"
            onClick={onSelect}
            aria-expanded={selected}
            aria-label={`Show ${category.name} subcategories`}
            className="cursor-pointer px-2 py-2 text-neutral-400 hover:text-brand"
          >
            <ChevronRight className="size-4" />
          </button>
        ) : null}
      </div>
    </li>
  );
}

/** A drill-down column: heading, its rows, and a link to the whole branch. */
function Column({ title, viewAllHref, children, empty }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3 border-b pb-2">
        <p className="truncate text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {title}
        </p>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="shrink-0 cursor-pointer text-xs font-medium text-brand hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>

      {empty ? (
        <p className="px-2.5 py-2 text-sm text-neutral-400">{empty}</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto">{children}</ul>
      )}
    </div>
  );
}

/**
 * Navbar item that reveals the product categories on hover, focus or tap.
 *
 * Three columns, drilled into rather than shown all at once: disciplines →
 * that discipline's subcategories → that subcategory's own children. Only
 * one branch is expanded at a time. The whole tree comes from the database
 * (lib/data/categories), so nothing here is specific to any discipline.
 *
 * The panel spans the full navbar width and is rendered inside the same
 * <li> as the trigger, so the pointer never leaves the hover target on the
 * way down (it is positioned against the nav container, which is relative).
 *
 * @param {{label: string, href: string}} link
 * @param {object[]} categories category tree from lib/data/categories
 */
export default function ShopMenu({ link, categories = [] }) {
  const [open, setOpen] = useState(false);
  const [disciplineId, setDisciplineId] = useState(null);
  const [subcategoryId, setSubcategoryId] = useState(null);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const hasCategories = categories.length > 0;

  // Default to the first discipline so the panel is never half empty.
  const discipline =
    categories.find((category) => category.id === disciplineId) ?? categories[0] ?? null;
  const subcategories = discipline?.children ?? [];
  const subcategory =
    subcategories.find((category) => category.id === subcategoryId) ?? null;
  const children = subcategory?.children ?? [];

  function openMenu() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenu() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  function selectDiscipline(category) {
    setDisciplineId(category.id);
    // Drilling into another discipline must not keep the old third column.
    setSubcategoryId(null);
  }

  return (
    <li
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onFocus={openMenu}
      onBlur={closeMenu}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          clearTimeout(closeTimer.current);
          setOpen(false);
        }
      }}
    >
      <Link
        href={link.href}
        aria-haspopup={hasCategories ? "true" : undefined}
        aria-expanded={hasCategories ? open : undefined}
        className="inline-flex cursor-pointer items-center gap-1 py-3.5 text-white/95 hover:text-white"
      >
        {link.label}
        <ChevronDown
          className={cn("size-3.5 transition-transform duration-200", open && "rotate-180")}
        />
      </Link>

      {hasCategories ? (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-0.5 rounded-2xl bg-white px-6 py-5 shadow-lg",
            "transform transition-all duration-300 ease-out",
            open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
          )}
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            <Column title="Shop by discipline" viewAllHref="/products">
              {categories.map((category) => (
                <DrillRow
                  key={category.id}
                  category={category}
                  selected={category.id === discipline?.id}
                  hasChildren={category.children?.length > 0}
                  onSelect={() => selectDiscipline(category)}
                />
              ))}
            </Column>

            <Column
              title={discipline?.name ?? "Categories"}
              viewAllHref={discipline ? categoryHref(discipline) : undefined}
              empty={subcategories.length === 0 ? "No subcategories yet." : null}
            >
              {subcategories.slice(0, MAX_NAV_SUBCATEGORIES).map((category) => (
                <DrillRow
                  key={category.id}
                  category={category}
                  selected={category.id === subcategory?.id}
                  hasChildren={category.children?.length > 0}
                  onSelect={() => setSubcategoryId(category.id)}
                />
              ))}
            </Column>

            <Column
              title={subcategory?.name ?? "Browse further"}
              viewAllHref={subcategory ? categoryHref(subcategory) : undefined}
              empty={
                !subcategory
                  ? "Choose a category to see what's inside."
                  : children.length === 0
                    ? "No further categories."
                    : null
              }
            >
              {children.map((category) => (
                <DrillRow key={category.id} category={category} hasChildren={false} />
              ))}
            </Column>
          </div>
        </div>
      ) : null}
    </li>
  );
}
