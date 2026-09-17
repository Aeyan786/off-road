import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data/products";
import { getCategoryOptions } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ProductsDataTable from "@/components/admin/products/ProductsDataTable";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";

export const metadata = {
  title: "Manage Products | Off Road Performance",
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

      <ProductsDataTable
        products={products}
        categoryOptions={categoryOptions}
        initialUploadOpen={initialUploadOpen}
      />
    </div>
  );
}
