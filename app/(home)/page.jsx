import { createClient } from "@/lib/supabase/server";
import { getSecondLevelCategories } from "@/lib/data/categories";
import { getProducts, toStorefrontProduct } from "@/lib/data/products";
import { safeQuery } from "@/lib/data/safe";
import Hero from "@/components/home/Hero";
import ShopByCategory from "@/components/home/ShopByCategory";
import OurProducts from "@/components/home/OurProducts";
import SuggestedForYou from "@/components/home/SuggestedForYou";
import NewArrivals from "@/components/home/NewArrivals";
import Features from "@/components/home/Features";
import RecentUpdates from "@/components/home/RecentUpdates";
import Newsletter from "@/components/home/Newsletter";
import Marquee from "@/components/home/Marquee";

// Product/category data is admin-managed and should reflect changes
// immediately rather than being cached at build time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const [subcategories, products] = await Promise.all([
    safeQuery(getSecondLevelCategories(supabase), []),
    safeQuery(getProducts(supabase, { limit: 8 }), []),
  ]);

  const storefrontProducts = products.map(toStorefrontProduct);

  return (
    <>
      <Hero />
      <ShopByCategory categories={subcategories} />
      <OurProducts products={storefrontProducts} />
      <SuggestedForYou />
      <NewArrivals />
      <Features />
      <RecentUpdates />
      <Newsletter />
      <Marquee />
    </>
  );
}
