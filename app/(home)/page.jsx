import { createClient } from "@/lib/supabase/server";
import { getSecondLevelCategories, withCategoryImages } from "@/lib/data/categories";
import { getProducts, toStorefrontProduct } from "@/lib/data/products";
import { getBlogs } from "@/lib/data/blogs";
import { safeQuery } from "@/lib/data/safe";
import { buildSuggestionTabs } from "@/lib/suggestions";
import Hero from "@/components/home/Hero";
import ShopByCategory from "@/components/home/ShopByCategory";
import OurProducts from "@/components/home/OurProducts";
import SuggestedForYou from "@/components/home/SuggestedForYou";
import NewArrivals from "@/components/home/NewArrivals";
import Services from "@/components/home/Services";
import Features from "@/components/home/Features";
import RecentUpdates from "@/components/home/RecentUpdates";
import Newsletter from "@/components/home/Newsletter";
import Marquee from "@/components/home/Marquee";

// Product/category data is admin-managed and should reflect changes
// immediately rather than being cached at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const [subcategories, products, recentBlogs] = await Promise.all([
    safeQuery(getSecondLevelCategories(supabase), []),
    safeQuery(getProducts(supabase), []),
    // Published only — getBlogs() leaves drafts out in the query.
    safeQuery(getBlogs(supabase, { limit: 6 }), []),
  ]);

  const storefrontProducts = products.slice(0,9).map(toStorefrontProduct);
  // Real categories as tabs; skips products already shown in Our Products.
  const suggestionTabs = buildSuggestionTabs(products, {
    exclude: new Set(products.map((p) => p.id)),
  }).map((tab) => ({ ...tab, products: tab.products.map(toStorefrontProduct) }));
  const newArrival = products.filter((e)=>e.new_arrival === true && e.status == "active").slice(0,4).map(toStorefrontProduct);

  return (
    <>
      <Hero />
      <ShopByCategory categories={withCategoryImages(subcategories, products)} />
      <OurProducts products={storefrontProducts} />
      <Services />
      <SuggestedForYou tabs={suggestionTabs} />
      <NewArrivals products={newArrival} />
      <Features />
      <RecentUpdates blogs={recentBlogs} />
      <Newsletter />
      {/* <Marquee /> */}
    </>
  );
}
