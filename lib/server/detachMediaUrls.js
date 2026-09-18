/**
 * Removes image URLs from every product that references them.
 *
 * `products.images` is a jsonb array of plain URL strings with no foreign key
 * to `media` (see supabase/migrations/0002_media.sql), so deleting a media
 * item can't cascade — the arrays have to be rewritten explicitly. It is the
 * only product column holding media URLs — blogs are handled separately by
 * detachMediaUrlsFromBlogs below.
 *
 * @returns {Promise<{productsUpdated: number}>}
 * @throws if a query fails, so callers can abort before deleting files
 */
export async function detachMediaUrlsFromProducts(supabase, urls) {
  const targets = [...new Set((urls ?? []).filter(Boolean))];
  if (targets.length === 0) return { productsUpdated: 0 };

  // One containment query per URL: URLs can hold characters that PostgREST's
  // `or` syntax would split on, and `contains` encodes a single value safely.
  // `images` is jsonb, so the value has to be passed as a JSON string —
  // handing `contains` a JS array renders a Postgres array literal, which
  // jsonb rejects with "invalid input syntax for type json".
  const affected = new Map();
  for (const url of targets) {
    const { data, error } = await supabase
      .from("products")
      .select("id, images")
      .contains("images", JSON.stringify([url]));

    if (error) throw new Error(error.message);
    for (const product of data) {
      affected.set(product.id, product.images ?? []);
    }
  }

  let productsUpdated = 0;
  for (const [id, images] of affected) {
    const remaining = images.filter((image) => !targets.includes(image));
    if (remaining.length === images.length) continue;

    const { error } = await supabase
      .from("products")
      .update({ images: remaining })
      .eq("id", id);

    if (error) throw new Error(error.message);
    productsUpdated += 1;
  }

  return { productsUpdated };
}

/**
 * Clears `blogs.image` wherever it points at one of these URLs, so a blog
 * never shows a broken image after its media item is deleted.
 *
 * @returns {Promise<{blogsUpdated: number}>}
 * @throws if the query fails, so callers can abort before deleting files
 */
export async function detachMediaUrlsFromBlogs(supabase, urls) {
  const targets = [...new Set((urls ?? []).filter(Boolean))];
  if (targets.length === 0) return { blogsUpdated: 0 };

  const { data, error } = await supabase
    .from("blogs")
    .update({ image: null })
    .in("image", targets)
    .select("id");

  if (error) throw new Error(error.message);
  return { blogsUpdated: data.length };
}
