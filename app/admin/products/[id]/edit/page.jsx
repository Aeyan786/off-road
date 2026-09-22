import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/data/products";
import { getCategoryOptions } from "@/lib/data/categories";
import { getSupplierOptions } from "@/lib/data/suppliers";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import ProductForm from "@/components/admin/products/ProductForm";

export const metadata = {
  title: "Edit Product | Off Road Performance",
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [product, categoryOptions, supplierOptions] = await Promise.all([
    getProductById(supabase, id, { includeAllStatuses: true }),
    getCategoryOptions(supabase),
    getSupplierOptions(supabase),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs
          items={[
            { label: "Products", href: "/admin/products" },
            { label: "Edit" },
            { label: product.product },
          ]}
        />
        <h1 className="text-2xl font-bold text-neutral-900">Edit Product</h1>
        <p className="text-sm text-neutral-500">{product.product}</p>
      </div>

      <ProductForm
        product={product}
        categoryOptions={categoryOptions}
        supplierOptions={supplierOptions}
      />
    </div>
  );
}
