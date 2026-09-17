import { createClient } from "@/lib/supabase/server";
import { getProducts, getProductFacets } from "@/lib/data/products";
import { getCategoryBranchBySlug } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import ProductCatalog from "@/components/product/ProductCatalog";
import { EMPTY_FACETS, readCatalogFilters } from "@/lib/catalog-filters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Products | Off Road Performance",
  description: "Browse every part in the catalog and filter by manufacturer, model, year and price.",
};

/**
 * Catalog grid. Every filter is read from the URL, which is what lets the
 * Shop mega-menu deep-link straight into a category (?category=slug) and
 * combine with the other filters without a second page.
 */
export default async function AllProductsPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  const branch = await safeQuery(
    getCategoryBranchBySlug(supabase, params?.category),
    null
  );

  const [facets, products] = await Promise.all([
    safeQuery(getProductFacets(supabase), EMPTY_FACETS),
    safeQuery(
      getProducts(supabase, {
        ...readCatalogFilters(params),
        categoryIds: branch?.ids,
      }),
      []
    ),
  ]);

  return (
    <ProductCatalog
      title={branch ? branch.category.name : "All Products"}
      products={products}
      facets={facets}
      activeCategory={branch?.category ?? null}
      basePath="/products"
      countNoun={branch ? "in this category" : "available"}
    />
  );
}
