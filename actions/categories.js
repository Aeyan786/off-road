"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { uniqueSlug } from "@/lib/server/resolveCategoryPath";

function revalidateCategoryViews() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
}

/**
 * Creates a category under `parentId` (omit/null for a top-level category).
 * Any depth is allowed — the tree has no hard-coded level limit.
 */
export async function createCategory({ name, parentId }) {
  const { supabase, error: authError } = await requireAdmin("categories");
  if (authError) return { error: authError };

  const trimmed = name?.trim();
  if (!trimmed) return { error: "Category name is required." };

  const slug = await uniqueSlug(supabase, trimmed);

  const { error } = await supabase.from("categories").insert({
    name: trimmed,
    slug,
    parent_id: parentId || null,
  });

  if (error) return { error: error.message };

  revalidateCategoryViews();
  return { success: true };
}

/**
 * Renames a category in place (same row, same id), at any level. The slug
 * is left unchanged so existing storefront links (?category=slug) and
 * bookmarks keep working.
 */
export async function updateCategory({ id, name }) {
  const { supabase, error: authError } = await requireAdmin("categories");
  if (authError) return { error: authError };

  const trimmed = name?.trim();
  if (!id) return { error: "Missing category." };
  if (!trimmed) return { error: "Category name is required." };

  const { data, error } = await supabase
    .from("categories")
    .update({ name: trimmed })
    .eq("id", id)
    .select("id");

  if (error) return { error: error.message };
  if (!data?.length) return { error: "This category no longer exists." };

  revalidateCategoryViews();
  return { success: true };
}

/**
 * Deletes a category. The DB cascades this to any descendant categories
 * (via parent_id) and to any products attached to it or its descendants
 * (via products.categories) — see supabase/migrations/0001_init.sql. The
 * confirmation UI is responsible for warning the admin before calling this.
 */
export async function deleteCategory(id) {
  const { supabase, error: authError } = await requireAdmin("categories");
  if (authError) return { error: authError };

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidateCategoryViews();
  return { success: true };
}
