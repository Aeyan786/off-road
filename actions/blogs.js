"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { removeUnusedMedia } from "@/lib/server/removeUnusedMedia";
import { parseBlogForm } from "@/lib/validation/blog";
import { PUBLISHED_STATUS } from "@/lib/data/blogs";
import { slugify } from "@/lib/slug";

function revalidateBlogViews() {
  revalidatePath("/admin/blogs");
  // "layout" also covers every /blogs/<slug> details page.
  revalidatePath("/blogs", "layout");
  revalidatePath("/");
}

/** "my-post", or "my-post-2", "my-post-3"… if that's taken. */
async function uniqueSlug(supabase, title) {
  const base = slugify(title) || "blog";

  const { data, error } = await supabase
    .from("blogs")
    .select("slug")
    .like("slug", `${base}%`);
  if (error) throw new Error(error.message);

  const taken = new Set(data.map((row) => row.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/**
 * Frees an image the blog no longer uses. Runs after the blog row has
 * changed, and never fails the save — at worst a file is left in the
 * library, where it's still visible and deletable from Media.
 */
async function cleanUpImage(supabase, url) {
  if (!url) return null;
  try {
    await removeUnusedMedia(supabase, [url]);
    return null;
  } catch (err) {
    console.error("[blogs] image cleanup failed:", err.message);
    return "Saved, but the previous image could not be removed from the media library.";
  }
}

/**
 * Creates a blog. The image is already a media-library URL by this point
 * (uploaded or picked in BlogImageField), so this only writes the row.
 */
export async function createBlog(formData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = parseBlogForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

  const blog = parsed.data;
  const published_at = blog.status === PUBLISHED_STATUS ? new Date().toISOString() : null;

  // A concurrent create can take the same slug between the lookup and the
  // insert; the unique constraint catches it and one retry picks the next.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    let slug;
    try {
      slug = await uniqueSlug(supabase, blog.title);
    } catch (err) {
      return { error: err.message };
    }

    const { error } = await supabase
      .from("blogs")
      .insert({ ...blog, slug, published_at });

    if (!error) {
      revalidateBlogViews();
      return { success: true, slug };
    }
    if (error.code !== "23505") return { error: error.message };
  }

  return { error: "Could not generate a unique link for this title. Please try again." };
}

/**
 * Updates a blog. The slug is kept as-is so published links never break.
 * If the image was replaced or removed, the old one is deleted from the
 * library unless a product or another blog still uses it.
 */
export async function updateBlog(id, formData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = parseBlogForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };

  const { data: existing, error: findError } = await supabase
    .from("blogs")
    .select("image, published_at")
    .eq("id", id)
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!existing) return { error: "This blog no longer exists." };

  const blog = parsed.data;
  const update = { ...blog };
  // Stamp the first publish only — unpublishing and republishing keeps the
  // original date.
  if (blog.status === PUBLISHED_STATUS && !existing.published_at) {
    update.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("blogs").update(update).eq("id", id);
  if (error) return { error: error.message };

  const warning =
    existing.image && existing.image !== blog.image
      ? await cleanUpImage(supabase, existing.image)
      : null;

  revalidateBlogViews();
  return { success: true, warning };
}

/** Deletes the blog, then its image if nothing else uses it. */
export async function deleteBlog(id) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: deleted, error } = await supabase
    .from("blogs")
    .delete()
    .eq("id", id)
    .select("image")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!deleted) return { error: "This blog no longer exists." };

  const warning = await cleanUpImage(supabase, deleted.image);

  revalidateBlogViews();
  return { success: true, warning };
}
