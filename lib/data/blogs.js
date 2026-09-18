/**
 * Only `published` blogs are visible on the storefront. The allowed values
 * are also enforced by a CHECK constraint (0006_blogs.sql) and in
 * lib/validation/blog.js.
 */
export const PUBLISHED_STATUS = "published";
export const BLOG_STATUSES = ["draft", "published"];

const BLOG_COLUMNS = `
  id,
  title,
  slug,
  image,
  content,
  status,
  published_at,
  created_at,
  updated_at
`;

/**
 * @param {object} [options]
 * @param {boolean} [options.includeDrafts] admin only. Off by default so a
 *   new public caller can't leak drafts by forgetting to filter.
 * @param {number} [options.limit]
 */
export async function getBlogs(supabase, options = {}) {
  let query = supabase.from("blogs").select(BLOG_COLUMNS);

  query = options.includeDrafts
    ? query.order("created_at", { ascending: false })
    : query
        .eq("status", PUBLISHED_STATUS)
        .order("published_at", { ascending: false });

  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Admin edit page — any status. A malformed id is simply "not found". */
export async function getBlogById(supabase, id) {
  if (!UUID_PATTERN.test(id ?? "")) return null;

  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Storefront details page — a draft's slug resolves to nothing. */
export async function getPublishedBlogBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from("blogs")
    .select(BLOG_COLUMNS)
    .eq("slug", slug)
    .eq("status", PUBLISHED_STATUS)
    .maybeSingle();

  if (error) throw error;
  return data;
}
