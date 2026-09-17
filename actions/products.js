"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { parseProductForm } from "@/lib/validation/product";

function revalidateProductViews() {
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/**
 * Creates a product from a validated form submission. Images are already
 * public URLs by this point — files picked in the form are uploaded into the
 * media library first (see ProductImagesField), so this action only writes
 * the product row.
 */
export async function createProduct(formData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = parseProductForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

  const { error } = await supabase.from("products").insert(parsed.data);
  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { sku: "A product with this SKU already exists." } };
    }
    return { error: error.message };
  }

  revalidateProductViews();
  return { success: true };
}

export async function updateProduct(id, formData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = parseProductForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { sku: "A product with this SKU already exists." } };
    }
    return { error: error.message };
  }

  revalidateProductViews();
  return { success: true };
}

export async function deleteProduct(id) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateProductViews();
  return { success: true };
}

// Bulk import lives in app/api/admin/products/bulk-import/route.js (a plain
// Route Handler, not a Server Action) — see that file for why.
