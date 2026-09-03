"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uniqueSlug } from "@/lib/server/resolveCategoryPath";

/**
 * Creates a category under `parentId` (omit/null for a top-level category).
 * Any depth is allowed — the tree has no hard-coded level limit.
 */
export async function createCategory({ name, parentId }) {
  const trimmed = name?.trim();
  if (!trimmed) return { error: "Category name is required." };

  const supabase = await createClient();
  const slug = await uniqueSlug(supabase, trimmed);

  const { error } = await supabase.from("categories").insert({
    name: trimmed,
    slug,
    parent_id: parentId || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

/**
 * Deletes a category. The DB cascades this to any descendant categories
 * (via parent_id) and to any products attached to it or its descendants
 * (via products.categories) — see supabase/migrations/0001_init.sql. The
 * confirmation UI is responsible for warning the admin before calling this.
 */
export async function deleteCategory(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}
