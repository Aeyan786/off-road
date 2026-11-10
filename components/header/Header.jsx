import TopBar from "@/components/header/TopBar";
import MainHeader from "@/components/header/MainHeader";
import NavBar from "@/components/header/NavBar";
import { createClient } from "@/lib/supabase/server";
import { getDistinctSuppliers } from "@/lib/data/products";
import { safeQuery } from "@/lib/data/safe";

/**
 * Fetches the header's data once — the vendor dropdown and the mobile menu
 * share it.
 */
export default async function Header() {
  const supabase = await createClient();
  const suppliers = await safeQuery(getDistinctSuppliers(supabase), []);

  return (
    <header className="sticky top-0 z-40">
      <TopBar />
      <MainHeader suppliers={suppliers} />
      <NavBar />
    </header>
  );
}
