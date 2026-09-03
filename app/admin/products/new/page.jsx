import { createClient } from "@/lib/supabase/server";
import { getCategoryOptions } from "@/lib/data/categories";
import { safeQuery } from "@/lib/data/safe";
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Add Product | Off Road Performance",
};

export default async function NewProductPage() {
  const supabase = await createClient();
  const categoryOptions = await safeQuery(getCategoryOptions(supabase), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Add Product</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Create a new product in your catalog.
        </p>
      </div>

      <ProductForm categoryOptions={categoryOptions} />
    </div>
  );
}
