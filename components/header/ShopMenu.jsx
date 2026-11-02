"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MAX_NAV_CATEGORIES } from "@/components/header/nav-links";
import { cn } from "@/lib/utils";

// Grace period so a diagonal mouse move from the trigger into the panel
// doesn't close the menu mid-travel.
const CLOSE_DELAY_MS = 140;

const categoryHref = (category) => `/products?category=${category.slug}`;

/**
 * Navbar item that reveals the main product categories on hover or focus.
 *
 * Only top-level categories are listed (up to MAX_NAV_CATEGORIES, in the
 * discipline order lib/data/categories applies) — subcategories are
 * browsed from the shop page's filters instead. Each links to its whole
 * branch of the catalogue.
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
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const mainCategories = categories.slice(0, MAX_NAV_CATEGORIES);
  const hasCategories = mainCategories.length > 0;

  function openMenu() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenu() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
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
          <ul className="grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3 lg:grid-cols-6">
            {mainCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={categoryHref(category)}
                  className="group/cat flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 hover:text-brand"
                >
                  <ChevronRight className="h-4 w-4 shrink-0 transition-colors group-hover/cat:border-brand"/>
              
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
