import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProducts, getProductFacets } from "@/lib/data/products";
import { getCategoryBranches, getTopLevelCategories } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import ProductCatalog from "@/components/product/ProductCatalog";
import { CatalogSkeleton } from "@/components/states/Skeletons";
import { EMPTY_FACETS, readCatalogFilters } from "@/lib/catalog-filters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Products",
  description: "Browse every part in the catalog and filter by manufacturer, model, year and price.",
};

/**
 * Catalog grid. Every filter is read from the URL, which is what lets the
 * Shop mega-menu deep-link straight into a category (?category=slug) and
 * combine with the other filters without a second page.
 */
/**
 * The skeleton is a Suspense fallback here rather than a loading.jsx file:
 * a route-level boundary would also wrap /products/[id], and a streamed
 * response can no longer change its status, so that page's notFound()
 * would answer 200 instead of 404.
 */
export default async function AllProductsPage({ searchParams }) {
  const params = await searchParams;

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogResults params={params} />
    </Suspense>
  );
}

async function CatalogResults({ params }) {
  const supabase = await createClient();

  // Several categories can be ticked at once; each contributes its whole branch.
  const branches = await safeQuery(
    getCategoryBranches(supabase, params?.category),
    null
  );
  const onlyCategory =
    branches?.categories.length === 1 ? branches.categories[0] : null;

  const [facets, categories, products] = await Promise.all([
    safeQuery(getProductFacets(supabase), EMPTY_FACETS),
    safeQuery(getTopLevelCategories(supabase), []),
    safeQuery(
      getProducts(supabase, {
        ...readCatalogFilters(params),
        categoryIds: branches?.ids,
      }),
      []
    ),
  ]);

  const { search } = readCatalogFilters(params);
  const countNoun = [
    branches ? (onlyCategory ? "in this category" : "in these categories") : "available",
    search ? `matching “${search}”` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ProductCatalog
      title={onlyCategory ? onlyCategory.name : "All Products"}
      products={products}
      facets={facets}
      categories={categories}
      activeCategories={branches?.categories ?? []}
      basePath="/products"
      countNoun={countNoun}
    />
  );
}
