"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MAX_NAV_SUBCATEGORIES } from "@/components/header/nav-links";
import { cn } from "@/lib/utils";

// Grace period so a diagonal mouse move from the trigger into the panel
// doesn't close the menu mid-travel.
const CLOSE_DELAY_MS = 140;

/** A subcategory link with the hollow bullet used under a column heading. */
function CategoryLink({ category }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group/cat flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-neutral-700 transition-colors hover:text-brand"
    >
    
      {category.name}
    </Link>
  );
}

/**
 * Navbar item that reveals the product categories on hover.
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

  function openMenu() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenu() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  const hasCategories = categories.length > 0;

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
      "absolute left-0 right-0 mt-0.5 top-full z-50 bg-white px-6 py-5 shadow-lg",
      "transform transition-all duration-300 ease-out rounded-2xl",
      open
        ? "translate-y-0 opacity-100 "
        : "-translate-y-3 pointer-events-none opacity-0"
    )}
  >
    <ul className="grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-6">
      {categories.slice(0,6).map((category) => (
        <li key={category.id}>
          <Link
            href={`/products?category=${category.slug}`}
            className="block cursor-pointer text-lg font-bold text-neutral-900 transition-colors hover:text-brand"
          >
            {category.name}
          </Link>

          {category.children?.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {/* Direct subcategories only — deeper levels stay out of the menu. */}
              {category.children.slice(0, MAX_NAV_SUBCATEGORIES).map((child) => (
                <li key={child.id}>
                  <CategoryLink category={child} />
                </li>
              ))}

              {category.children.length > MAX_NAV_SUBCATEGORIES ? (
                <li>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="inline-flex cursor-pointer items-center gap-1 pt-2 text-sm font-semibold text-brand hover:underline"
                  >
                    View All
                    <ChevronRight className="size-3.5" />
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  </div>
) : null}
    </li>
  );
}
