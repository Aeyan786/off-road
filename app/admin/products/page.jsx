import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data/products";
import { getCategoryOptions } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ProductsDataTable from "@/components/admin/products/ProductsDataTable";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import StatCard from "@/components/admin/StatCard";
import { LOW_STOCK_THRESHOLD, summarizeInventory } from "@/lib/inventory";
import { formatPrice } from "@/lib/format";
import { Package, PackageX, PoundSterling, TriangleAlert } from "lucide-react";

export const metadata = {
  title: "Manage Products",
};

export default async function ManageProductsPage({ searchParams }) {
  const params = await searchParams;
  const initialUploadOpen = params?.upload === "1";

  const supabase = await createClient();

  let products = [];
  let setupError = null;
  try {
    products = await getProducts(supabase, { includeAllStatuses: true });
  } catch (err) {
    setupError = err.message;
  }

  const categoryOptions = await safeQuery(getCategoryOptions(supabase), []);
  const inventory = summarizeInventory(products);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Products" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Manage Products</h1>
        <p className="text-sm text-neutral-500">
          View, filter, and import products.
        </p>
      </div>

      {setupError ? <SetupRequiredBanner message={setupError} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={inventory.total.toLocaleString("en-GB")}
          hint={`${inventory.active} active · ${inventory.draft} draft`}
          icon={Package}
        />
        <StatCard
          title="Low Stock"
          value={inventory.lowStock.toLocaleString("en-GB")}
          hint={`1–${LOW_STOCK_THRESHOLD} units left`}
          icon={TriangleAlert}
          tone={inventory.lowStock > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Out of Stock"
          value={inventory.outOfStock.toLocaleString("en-GB")}
          hint="0 units — can't be added to cart"
          icon={PackageX}
          tone={inventory.outOfStock > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Stock Value"
          value={formatPrice(inventory.stockValue)}
          hint={`${inventory.units.toLocaleString("en-GB")} units at selling price`}
          icon={PoundSterling}
        />
      </div>

      <ProductsDataTable
        products={products}
        categoryOptions={categoryOptions}
        initialUploadOpen={initialUploadOpen}
      />
    </div>
  );
}
