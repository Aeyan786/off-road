// Same bucket the media library writes to (see actions/media.js).
const MEDIA_BUCKET = "product_bucket";

/**
 * Deletes media-library images that nothing references any more — the
 * storage file and its `media` row. Called after a blog is deleted or its
 * image replaced, so the blog's own row no longer counts as a reference.
 *
 * An image is kept if any product (products.images) or blog (blogs.image)
 * still uses it, because library images are shared. URLs that aren't in the
 * media library (e.g. external CDN images) are left alone.
 *
 * @returns {Promise<{removed: number}>}
 * @throws if a query fails
 */
export async function removeUnusedMedia(supabase, urls) {
  const targets = [...new Set((urls ?? []).filter(Boolean))];
  let removed = 0;

  for (const url of targets) {
    // jsonb containment needs a JSON string (see detachMediaUrls.js).
    const [products, blogs] = await Promise.all([
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .contains("images", JSON.stringify([url])),
      supabase
        .from("blogs")
        .select("id", { count: "exact", head: true })
        .eq("image", url),
    ]);
    if (products.error) throw new Error(products.error.message);
    if (blogs.error) throw new Error(blogs.error.message);
    if (products.count > 0 || blogs.count > 0) continue;

    const { data: item, error: findError } = await supabase
      .from("media")
      .select("id, storage_path")
      .eq("file_url", url)
      .maybeSingle();
    if (findError) throw new Error(findError.message);
    if (!item) continue;

    const { error: storageError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([item.storage_path]);
    if (storageError) throw new Error(storageError.message);

    const { error: deleteError } = await supabase.from("media").delete().eq("id", item.id);
    if (deleteError) throw new Error(deleteError.message);

    removed += 1;
  }

  return { removed };
}
