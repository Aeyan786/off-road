import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProducts, getProductFacets, NEW_ARRIVAL_DAYS } from "@/lib/data/products";
import { getCategoryBranches, getCategoryFilterTree } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import ProductCatalog from "@/components/product/ProductCatalog";
import { CatalogSkeleton } from "@/components/states/Skeletons";
import { EMPTY_FACETS, readCatalogFilters } from "@/lib/catalog-filters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New arrivals",
  description: "The latest parts added to the catalog.",
};

/**
 * Same catalog as /products, narrowed to the current new arrivals: active
 * products created in the last NEW_ARRIVAL_DAYS days, newest first. The list
 * is automatic — a product imported or added in the admin qualifies at once,
 * with no flag to set, and ages out on its own — and the page's own filters
 * apply within that set.
 */
export default async function NewArrivalsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <NewArrivalsResults params={params} />
    </Suspense>
  );
}

async function NewArrivalsResults({ params }) {
  const supabase = await createClient();

  const branches = await safeQuery(
    getCategoryBranches(supabase, params?.category),
    null
  );

  const [facets, categories, products] = await Promise.all([
    safeQuery(getProductFacets(supabase, { newArrivalsOnly: true }), EMPTY_FACETS),
    safeQuery(getCategoryFilterTree(supabase), []),
    safeQuery(
      getProducts(supabase, {
        ...readCatalogFilters(params),
        categoryIds: branches?.ids,
        newArrivalsOnly: true,
      }),
      []
    ),
  ]);

  return (
    <ProductCatalog
      title="New arrivals"
      products={products}
      facets={facets}
      categoryTree={categories}
      basePath="/new-arrivals"
      countNoun={`added in the last ${NEW_ARRIVAL_DAYS} days`}
      emptyMessage={`No products have been added in the last ${NEW_ARRIVAL_DAYS} days.`}
    />
  );
}
