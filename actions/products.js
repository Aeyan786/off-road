"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { parseProductForm } from "@/lib/validation/product";
import { PRODUCT_STATUSES } from "@/lib/data/products";
import { resolveSupplierId } from "@/lib/server/resolveSupplier";

function revalidateProductViews() {
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/**
 * Turns the form's supplier choice into a supplier_id. A typed "Other" name
 * reuses an existing supplier with the same name (ignoring case) and only
 * creates a new one when none exists.
 *
 * @returns {Promise<{supplierId: string, created: boolean}|{error: string}>}
 */
async function supplierIdFor(supabase, choice) {
  if (choice.supplierId) return { supplierId: choice.supplierId, created: false };
  try {
    const resolved = await resolveSupplierId(supabase, choice.newName);
    return { supplierId: resolved.id, created: resolved.created };
  } catch (err) {
    return { error: `Could not save the supplier: ${err.message}` };
  }
}

/** Maps DB errors shared by create/update onto form feedback. */
function productWriteError(error) {
  if (error.code === "23505") {
    return { fieldErrors: { sku: "A product with this SKU already exists." } };
  }
  if (error.code === "23503" && /supplier/i.test(error.message ?? "")) {
    return { fieldErrors: { supplier: "That supplier no longer exists. Choose another." } };
  }
  return { error: error.message };
}

/**
 * Creates a product from a validated form submission. Images are already
 * public URLs by this point — files picked in the form are uploaded into the
 * media library first (see ProductImagesField), so this action only writes
 * the product row.
 */
export async function createProduct(formData) {
  const { supabase, error: authError } = await requireAdmin("products");
  if (authError) return { error: authError };

  const parsed = parseProductForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

  const supplier = await supplierIdFor(supabase, parsed.supplier);
  if (supplier.error) return { error: supplier.error };

  const { error } = await supabase
    .from("products")
    .insert({ ...parsed.data, supplier_id: supplier.supplierId });
  if (error) return productWriteError(error);

  revalidateProductViews();
  if (supplier.created) revalidatePath("/admin/suppliers");
  return { success: true };
}

export async function updateProduct(id, formData) {
  const { supabase, error: authError } = await requireAdmin("products");
  if (authError) return { error: authError };

  const parsed = parseProductForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

  const supplier = await supplierIdFor(supabase, parsed.supplier);
  if (supplier.error) return { error: supplier.error };

  const { error } = await supabase
    .from("products")
    .update({ ...parsed.data, supplier_id: supplier.supplierId })
    .eq("id", id);
  if (error) return productWriteError(error);

  revalidateProductViews();
  revalidatePath("/admin/suppliers");
  return { success: true };
}

/**
 * Publishes or unpublishes a product straight from the listing. The column
 * is plain text with no DB constraint, so the value is checked here.
 */
export async function setProductStatus(id, status) {
  const { supabase, error: authError } = await requireAdmin("products");
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
  const { supabase, error: authError } = await requireAdmin("products");
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
  const { supabase, error: authError } = await requireAdmin("products");
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
