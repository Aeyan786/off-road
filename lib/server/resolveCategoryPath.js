import { slugify } from "@/lib/slug";

/**
 * Finds-or-creates a chain of categories (e.g. ["ATV", "ATV Exhaust",
 * "Slip-On Exhaust"]) and returns the id of the deepest (leaf) one. Each
 * level is matched case-insensitively against existing categories with the
 * same parent — if it already exists it's reused, never duplicated.
 *
 * `cache` is an optional Map the caller can reuse across many rows in the
 * same import so repeated paths only hit the DB once.
 */
export async function resolveCategoryPath(supabase, names, cache = new Map()) {
  const path = names.map((n) => n?.toString().trim()).filter(Boolean);
  if (path.length === 0) return { id: null, created: 0 };

  let parentId = null;
  let created = 0;

  for (const name of path) {
    const cacheKey = `${parentId ?? "root"}::${name.toLowerCase()}`;

    if (cache.has(cacheKey)) {
      parentId = cache.get(cacheKey);
      continue;
    }

    let query = supabase.from("categories").select("id").ilike("name", name);
    query = parentId ? query.eq("parent_id", parentId) : query.is("parent_id", null);
    const { data: existing, error: findError } = await query.maybeSingle();
    if (findError) throw findError;

    if (existing) {
      cache.set(cacheKey, existing.id);
      parentId = existing.id;
      continue;
    }

    const slug = await uniqueSlug(supabase, name);
    const { data: inserted, error: insertError } = await supabase
      .from("categories")
      .insert({ name, slug, parent_id: parentId })
      .select("id")
      .single();
    if (insertError) throw insertError;

    created += 1;
    cache.set(cacheKey, inserted.id);
    parentId = inserted.id;
  }

  return { id: parentId, created };
}

export async function uniqueSlug(supabase, name) {
  const base = slugify(name) || "category";
  let slug = base;
  let attempt = 1;

  while (attempt < 20) {
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return slug;

    attempt += 1;
    slug = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}
