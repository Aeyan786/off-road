"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { normalizeSupplierName } from "@/lib/server/resolveSupplier";

const DUPLICATE_MESSAGE = "A supplier with this name already exists.";

function revalidateSupplierViews() {
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/products");
  // Supplier names appear in the header vendor menu on every storefront page.
  revalidatePath("/", "layout");
}

function validateName(raw) {
  const name = normalizeSupplierName(raw);
  if (!name) return { fieldError: "Supplier name is required." };
  if (name.length > 120) return { fieldError: "Supplier name must be 120 characters or fewer." };
  return { name };
}

export async function createSupplier({ name: rawName }) {
  const { supabase, error: authError } = await requireAdmin("suppliers");
  if (authError) return { error: authError };

  const { name, fieldError } = validateName(rawName);
  if (fieldError) return { fieldErrors: { name: fieldError } };

  const { error } = await supabase.from("suppliers").insert({ name });
  if (error) {
    if (error.code === "23505") return { fieldErrors: { name: DUPLICATE_MESSAGE } };
    return { error: error.message };
  }

  revalidateSupplierViews();
  return { success: true, name };
}

/**
 * Renames a supplier in place. Products reference it by id, so every
 * product picks up the new name automatically.
 */
export async function updateSupplier({ id, name: rawName }) {
  const { supabase, error: authError } = await requireAdmin("suppliers");
  if (authError) return { error: authError };

  const { name, fieldError } = validateName(rawName);
  if (fieldError) return { fieldErrors: { name: fieldError } };

  const { data, error } = await supabase
    .from("suppliers")
    .update({ name })
    .eq("id", id)
    .select("id");

  if (error) {
    if (error.code === "23505") return { fieldErrors: { name: DUPLICATE_MESSAGE } };
    return { error: error.message };
  }
  if (!data?.length) return { error: "This supplier no longer exists." };

  revalidateSupplierViews();
  return { success: true, name };
}

/**
 * Deletes a supplier that no products use. The foreign key is ON DELETE
 * RESTRICT, so the database refuses anyway if products still reference it;
 * the count check just gives a clearer message first.
 */
export async function deleteSupplier(id) {
  const { supabase, error: authError } = await requireAdmin("suppliers");
  if (authError) return { error: authError };

  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", id);
  if (countError) return { error: countError.message };

  if (count > 0) {
    return {
      error: `This supplier is used by ${count} product${count === 1 ? "" : "s"}. Move ${count === 1 ? "it" : "them"} to another supplier before deleting.`,
    };
  }

  const { data, error } = await supabase.from("suppliers").delete().eq("id", id).select("id");
  if (error) {
    if (error.code === "23503") {
      return { error: "This supplier is still used by products and can't be deleted." };
    }
    return { error: error.message };
  }
  if (!data?.length) return { error: "This supplier no longer exists." };

  revalidateSupplierViews();
  return { success: true };
}
