/**
 * Categories are a self-referencing tree (parent_id) with no fixed depth
 * limit at the schema level. In practice the storefront/admin UI works
 * with up to 3 levels — category -> subcategory -> sub-subcategory — but
 * the tree-building helpers below are depth-agnostic.
 */

export async function getAllCategoriesFlat(supabase) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, created_at")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/** Nests a flat category list into a tree, each node gaining `children`. */
export function buildCategoryTree(flatCategories) {
  const nodes = new Map(
    flatCategories.map((c) => [c.id, { ...c, children: [] }])
  );
  const roots = [];

  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getCategoryTree(supabase) {
  const flat = await getAllCategoriesFlat(supabase);
  return buildCategoryTree(flat);
}

/**
 * Direct children of top-level categories only (e.g. "ATV Exhaust" under
 * "ATV"). Used by the storefront's Shop By Category section.
 */
export async function getSecondLevelCategories(supabase) {
  const tree = await getCategoryTree(supabase);
  return tree.flatMap((root) =>
    root.children.map((child) => ({
      ...child,
      parent: { id: root.id, name: root.name },
    }))
  );
}

/**
 * Looks up a category by slug and returns it with the ids of every
 * category beneath it. Selecting "ATV" in the storefront should show
 * everything filed under its subcategories too, so products are matched
 * against the whole set.
 *
 * @returns {Promise<{category: object, ids: string[]}|null>}
 */
export async function getCategoryBranchBySlug(supabase, slug) {
  if (!slug) return null;

  const flat = await getAllCategoriesFlat(supabase);
  const match = flat.find((category) => category.slug === slug);
  if (!match) return null;

  const childrenByParent = new Map();
  for (const category of flat) {
    if (!category.parent_id) continue;
    if (!childrenByParent.has(category.parent_id)) {
      childrenByParent.set(category.parent_id, []);
    }
    childrenByParent.get(category.parent_id).push(category);
  }

  const ids = [];
  const queue = [match];
  while (queue.length > 0) {
    const current = queue.shift();
    ids.push(current.id);
    queue.push(...(childrenByParent.get(current.id) ?? []));
  }

  return { category: match, ids };
}

/**
 * Every category at any depth, each annotated with a human-readable
 * breadcrumb `path` (e.g. "ATV / ATV Exhaust / Slip-On"). Used to populate
 * the product form's category select.
 */
export async function getCategoryOptions(supabase) {
  const flat = await getAllCategoriesFlat(supabase);
  const byId = new Map(flat.map((c) => [c.id, c]));

  function pathFor(category) {
    const parts = [category.name];
    let current = category;
    while (current.parent_id && byId.has(current.parent_id)) {
      current = byId.get(current.parent_id);
      parts.unshift(current.name);
    }
    return parts.join(" / ");
  }

  return flat
    .map((c) => ({ id: c.id, name: c.name, path: pathFor(c) }))
    .sort((a, b) => a.path.localeCompare(b.path));
}
