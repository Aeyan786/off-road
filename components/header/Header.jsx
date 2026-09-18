import TopBar from "@/components/header/TopBar";
import MainHeader from "@/components/header/MainHeader";
import NavBar from "@/components/header/NavBar";
import { createClient } from "@/lib/supabase/server";
import { getCategoryTree } from "@/lib/data/categories";
import { getDistinctSuppliers } from "@/lib/data/products";
import { safeQuery } from "@/lib/data/safe";

/**
 * Fetches the header's data once — the desktop navbar (Shop mega-menu), the
 * vendor dropdown and the mobile menu all share it.
 */
export default async function Header() {
  const supabase = await createClient();
  const [categories, suppliers] = await Promise.all([
    safeQuery(getCategoryTree(supabase), []),
    safeQuery(getDistinctSuppliers(supabase), []),
  ]);

  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <MainHeader categories={categories} suppliers={suppliers} />
      <NavBar categories={categories} />
    </header>
  );
}
