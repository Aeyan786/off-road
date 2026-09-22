import { createClient } from "@/lib/supabase/server";
import { getCategoryOptions } from "@/lib/data/categories";
import { getSupplierOptions } from "@/lib/data/suppliers";
import { safeQuery } from "@/lib/data/safe";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Add Product | Off Road Performance",
};

export default async function NewProductPage() {
  const supabase = await createClient();
  const [categoryOptions, supplierOptions] = await Promise.all([
    safeQuery(getCategoryOptions(supabase), []),
    safeQuery(getSupplierOptions(supabase), []),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs
          items={[{ label: "Products", href: "/admin/products" }, { label: "New" }]}
        />
        <h1 className="text-2xl font-bold text-neutral-900">Add Product</h1>
        <p className="text-sm text-neutral-500">
          Create a new product in your catalog.
        </p>
      </div>

      <ProductForm categoryOptions={categoryOptions} supplierOptions={supplierOptions} />
    </div>
  );
}
