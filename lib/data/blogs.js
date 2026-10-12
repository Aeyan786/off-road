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
 * @param {string} [options.search] matches the title
 * @param {"newest"|"oldest"} [options.sort] default newest first
 * @param {string} [options.from] ISO date — published on or after
 * @param {string} [options.to] ISO date — published on or before
 *
 * Public callers are sorted and filtered by `published_at` (the date the
 * storefront shows); the admin list stays on `created_at` so unpublished
 * drafts still appear in a sensible order.
 */
export async function getBlogs(supabase, options = {}) {
  let query = supabase.from("blogs").select(BLOG_COLUMNS);

  const ascending = options.sort === "oldest";
  const dateColumn = options.includeDrafts ? "created_at" : "published_at";

  query = options.includeDrafts
    ? query.order("created_at", { ascending })
    : query.eq("status", PUBLISHED_STATUS).order("published_at", { ascending });

  if (options.search) {
    // `_` is LIKE's single-character wildcard; escape it so it stays literal.
    const pattern = options.search.trim().replace(/_/g, "\_");
    if (pattern) query = query.ilike("title", `%${pattern}%`);
  }

  if (options.from) query = query.gte(dateColumn, options.from);
  // `to` is inclusive of the whole day the reader picked.
  if (options.to) query = query.lte(dateColumn, `${options.to}T23:59:59.999Z`);

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
