import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/data/products";
import { getCategoryOptions } from "@/lib/data/categories";
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Edit Product | Off Road Performance",
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [product, categoryOptions] = await Promise.all([
    getProductById(supabase, id),
    getCategoryOptions(supabase),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
        <p className="mt-1 text-sm text-neutral-500">{product.product}</p>
      </div>

      <ProductForm product={product} categoryOptions={categoryOptions} />
    </div>
  );
}
