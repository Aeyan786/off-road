import { createClient } from "@/lib/supabase/server";
import { getProducts, getProductFacets } from "@/lib/data/products";
import { safeQuery } from "@/lib/data/safe";
import ProductCatalog from "@/components/product/ProductCatalog";
import { EMPTY_FACETS, readCatalogFilters } from "@/lib/catalog-filters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Arrivals",
  description: "The latest parts added to the catalog.",
};

/**
 * Same catalog as /products, with `new_arrival = true` as an extra base
 * condition on top of the active-status filter every public query applies.
 * Filters, grid and card behaviour are the shared components.
 */
export default async function NewArrivalsPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  const [facets, products] = await Promise.all([
    safeQuery(getProductFacets(supabase, { newArrivalOnly: true }), EMPTY_FACETS),
    safeQuery(
      getProducts(supabase, {
        ...readCatalogFilters(params),
        newArrivalOnly: true,
      }),
      []
    ),
  ]);

  return (
    <ProductCatalog
      title="New Arrivals"
      products={products}
      facets={facets}
      basePath="/new-arrivals"
      countNoun="in new arrivals"
      emptyMessage="No new arrivals match these filters."
    />
  );
}
