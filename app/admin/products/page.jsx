import { createClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/data/products";
import ProductsToolbar from "@/components/admin/products/ProductsToolbar";
import ProductsTable from "@/components/admin/products/ProductsTable";
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
    products = await getProducts(supabase, { search: params?.search });
  } catch (err) {
    setupError = err.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Manage Products
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          View, search, and import products.
        </p>
      </div>

      {setupError ? <SetupRequiredBanner message={setupError} /> : null}

      <ProductsToolbar initialUploadOpen={initialUploadOpen} />
      <ProductsTable products={products} />
    </div>
  );
}
