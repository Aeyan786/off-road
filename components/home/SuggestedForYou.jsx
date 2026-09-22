"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "@/components/home/ProductCard";
import ButtonLink from "@/components/ui/button-link";
import { cn } from "@/lib/utils";

/**
 * @param {{key: string, label: string, products: object[]}[]} tabs from
 *   lib/suggestions.js — "All" first, then real categories. Products are
 *   already in ProductCard shape.
 */
export default function SuggestedForYou({ tabs = [] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  if (tabs.length === 0) return null;

  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];

  return (
    <section className="border-y border-brand/15 bg-brand/5">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
      
            <h2 className="mt-2 text-3xl font-bold text-neutral-900 sm:text-4xl">
              Suggested For You
            </h2>
            <p className="mt-2 max-w-xl text-sm text-neutral-500">
              Popular parts from our most-stocked categories.
            </p>
          </div>

          {tabs.length > 1 ? (
            <div role="tablist" aria-label="Suggestion categories" className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const selected = tab.key === active.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveKey(tab.key)}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      selected
                        ? "border-brand bg-brand text-white"
                        : "border-neutral-300 bg-white text-neutral-700 hover:border-brand hover:text-brand"
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div role="tabpanel" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {active.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <ButtonLink
            href={active.key === "all" ? "/products" : `/products?category=${active.slug}`}
            variant="outline"
            className="cursor-pointer rounded-sm bg-white px-4"
          >
            {active.key === "all" ? "Browse all products" : `View all ${active.label}`}
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
