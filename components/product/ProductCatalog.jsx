import ProductFilters from "@/components/product/ProductFilters";
import ProductGrid from "@/components/home/ProductGrid";
import { toStorefrontProduct } from "@/lib/data/products";

/**
 * Shared catalog layout: heading, count, sticky filter rail and the product
 * grid. Both /products and /new-arrivals render this, so the filtering UI
 * and card behaviour stay identical — only the base query differs.
 *
 * @param {string} title
 * @param {object[]} products raw product rows
 * @param {object} facets filter options for this page's base set
 * @param {object} [activeCategory] shown as a clearable chip when present
 * @param {string} basePath route the filters write their query string to
 * @param {string} [countNoun] trailing words after the product count
 * @param {string} [emptyMessage]
 */
export default function ProductCatalog({
  title,
  products,
  facets,
  activeCategory = null,
  basePath,
  countNoun = "available",
  emptyMessage = "No products match these filters.",
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {products.length} product{products.length === 1 ? "" : "s"} {countNoun}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <div className="self-start lg:sticky lg:top-46">
          <ProductFilters
            facets={facets}
            activeCategory={activeCategory}
            basePath={basePath}
          />
        </div>

        <div>
          {products.length > 0 ? (
            <ProductGrid products={products.map(toStorefrontProduct)} />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-neutral-300 py-20 text-center">
              <p className="text-sm font-medium text-neutral-700">{emptyMessage}</p>

              <p className="text-xs text-neutral-500">
                Try clearing a filter or widening the price range.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
