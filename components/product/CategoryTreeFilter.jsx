"use client";

import { useEffect, useRef, useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { ChevronRight, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { isCategoryActive } from "@/lib/category-selection";
import { cn } from "@/lib/utils";

// Small grace period so moving the pointer from a row into its menu
// doesn't close the menu on the way.
const CLOSE_DELAY_MS = 150;

/** One checkbox row, in the same style as the other filter options. */
function CategoryCheckbox({ category, checked, onToggle, className }) {
  return (
    <label
      className={cn(
        "flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-sm px-1.5 py-1.5 text-sm transition-colors hover:bg-neutral-50",
        checked ? "font-medium text-neutral-900" : "text-neutral-700",
        className
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onToggle(category.slug, next)}
        className="cursor-pointer"
      />
      <span className="min-w-0 break-words">{category.name}</span>
    </label>
  );
}

/**
 * A subcategory row. Its own children (the sub-subcategories) open in a
 * menu beside it: on hover with a mouse, or by tapping the arrow on touch
 * screens and with the keyboard. The menu is portalled, so the filter
 * rail's scroll container can't clip it.
 */
function SubcategoryRow({ category, selected, index, onToggle, openSlug, setOpenSlug }) {
  const children = category.children ?? [];
  const hasChildren = children.length > 0;
  const open = openSlug === category.slug;
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function openMenu(event) {
    // Hover-to-open is for mice only; touch uses the arrow, so a tap on the
    // label just ticks the box rather than also popping a menu.
    if (!hasChildren || (event && event.pointerType !== "mouse")) return;
    clearTimeout(closeTimer.current);
    setOpenSlug(category.slug);
  }

  function scheduleClose(event) {
    if (!hasChildren || (event && event.pointerType !== "mouse")) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => setOpenSlug((current) => (current === category.slug ? null : current)),
      CLOSE_DELAY_MS
    );
  }

  const selectedChildren = children.filter((child) => selected.includes(child.slug));

  return (
    <li>
      <Popover.Root
        open={open}
        onOpenChange={(next) => setOpenSlug(next ? category.slug : null)}
      >
        <div
          className="flex items-center gap-1"
          onPointerEnter={openMenu}
          onPointerLeave={scheduleClose}
        >
          <CategoryCheckbox
            category={category}
            checked={isCategoryActive(index, category.slug, selected)}
            onToggle={onToggle}
          />

          {hasChildren ? (
            <Popover.Trigger
              aria-label={`Show ${category.name} categories`}
              className={cn(
                "shrink-0 cursor-pointer rounded-sm p-1.5 transition-colors hover:bg-neutral-100 hover:text-brand",
                open ? "text-brand" : "text-neutral-400"
              )}
            >
              <ChevronRight className="size-4" />
            </Popover.Trigger>
          ) : null}
        </div>

        {hasChildren ? (
          <Popover.Portal>
            <Popover.Positioner side="right" align="start" sideOffset={8} className="z-50">
              <Popover.Popup
                onPointerEnter={() => clearTimeout(closeTimer.current)}
                onPointerLeave={scheduleClose}
                className="w-60 max-h-(--available-height) overflow-y-auto rounded-md border border-neutral-200 bg-white p-2 shadow-lg outline-none"
              >
                <p className="px-1.5 pb-1.5 text-xs font-medium text-neutral-500">
                  {category.name}
                </p>
                <ul className="space-y-0.5">
                  {children.map((child) => (
                    <li key={child.slug}>
                      <CategoryCheckbox
                        category={child}
                        checked={isCategoryActive(index, child.slug, selected)}
                        onToggle={onToggle}
                      />
                    </li>
                  ))}
                </ul>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        ) : null}
      </Popover.Root>

      {/* What's ticked inside the menu stays visible without opening it. */}
      {selectedChildren.length > 0 ? (
        <ul className="mb-1 ml-8 flex flex-wrap gap-1.5">
          {selectedChildren.map((child) => (
            <li
              key={child.slug}
              className="flex items-center gap-1 rounded-sm border bg-neutral-50 py-0.5 pl-2 pr-1 text-xs text-neutral-700"
            >
              {child.name}
              <button
                type="button"
                onClick={() => onToggle(child.slug, false)}
                aria-label={`Remove ${child.name}`}
                className="cursor-pointer rounded-sm p-0.5 text-neutral-400 hover:text-neutral-700"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/**
 * Category filter as a drill-down: main categories, then — once one is
 * ticked — its subcategories beneath it, each opening its own
 * sub-subcategories in a menu. Everything comes from the category tree in
 * the database; nothing here knows about any particular category.
 *
 * @param {object[]} tree categories with nested `children`
 * @param {Map} index from indexCategoryTree(tree)
 * @param {string[]} selected the slugs in the URL
 * @param {(slug: string, checked: boolean) => void} onToggle
 */
export default function CategoryTreeFilter({ tree, index, selected, onToggle }) {
  const [openSlug, setOpenSlug] = useState(null);

  if (tree.length === 0) {
    return <p className="px-1.5 py-1 text-xs text-neutral-400">No options</p>;
  }

  return (
    <ul className="space-y-0.5">
      {tree.map((root) => {
        const active = isCategoryActive(index, root.slug, selected);
        const subcategories = root.children ?? [];

        return (
          <li key={root.slug}>
            <CategoryCheckbox category={root} checked={active} onToggle={onToggle} />

            {/* Only the ticked main category opens, so unrelated
                subcategories never crowd the list. */}
            {active && subcategories.length > 0 ? (
              <ul className="ml-4 space-y-0.5 border-l border-neutral-200 pl-2">
                {subcategories.map((subcategory) => (
                  <SubcategoryRow
                    key={subcategory.slug}
                    category={subcategory}
                    selected={selected}
                    index={index}
                    onToggle={onToggle}
                    openSlug={openSlug}
                    setOpenSlug={setOpenSlug}
                  />
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
