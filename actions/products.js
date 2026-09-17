"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { parseProductForm } from "@/lib/validation/product";
import { PRODUCT_STATUSES } from "@/lib/data/products";

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

/**
 * Publishes or unpublishes a product straight from the listing. The column
 * is plain text with no DB constraint, so the value is checked here.
 */
export async function setProductStatus(id, status) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!PRODUCT_STATUSES.includes(status)) {
    return { error: `"${status}" is not a valid product status.` };
  }

  const { error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidateProductViews();
  return { success: true, status };
}

export async function deleteProduct(id) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateProductViews();
  return { success: true };
}

/**
 * Deletes the products the admin selected in the listing, and nothing else.
 * Images are left alone on purpose — products reference media by URL and the
 * same image can be used by other products, so the library is not touched
 * (same as deleting a single product).
 */
export async function deleteProducts(ids) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const productIds = (Array.isArray(ids) ? ids : []).filter(Boolean);
  if (productIds.length === 0) return { error: "No products were selected." };

  const { data, error } = await supabase
    .from("products")
    .delete()
    .in("id", productIds)
    .select("id");

  if (error) return { error: error.message };

  revalidateProductViews();
  return { success: true, deleted: data.length };
}

// Bulk import lives in app/api/admin/products/bulk-import/route.js (a plain
// Route Handler, not a Server Action) — see that file for why.
