/**
 * Cascading catalogue filters: category → manufacturer → model → year.
 *
 * Each list is narrowed by every level above it:
 *   manufacturers  by the ticked categories
 *   models         by the ticked categories + manufacturers
 *   years          by the ticked categories + manufacturers + models
 * Several ticks at one level combine (Honda + Yamaha shows both makes'
 * models). With nothing ticked above a list, it shows everything.
 *
 * Works from a compact "facet tree" sent by the server (one row per
 * distinct category/manufacturer/model/year combination, not one per
 * product), so the same function decides what's displayed AND which
 * selections have gone stale — they can never disagree, and stale ticks are
 * cleared in the same navigation as the change that orphaned them.
 *
 * Pure and dependency-free: runs on the server and in the browser.
 */

/**
 * @typedef {{c: string|null, m: string|null, md: string|null, y: string|null}} FacetRow
 * @typedef {{rows: FacetRow[], paths: Record<string, string[]>}} FacetTree
 *   `paths[categoryId]` lists the slugs from the top-level category down to
 *   that category, so a row matches a ticked category at any depth.
 */

const sorted = (values) =>
  [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))].sort(
    (a, b) => String(a).localeCompare(String(b))
  );

function rowsInCategories(tree, categories) {
  if (!categories?.length) return tree.rows;
  return tree.rows.filter((row) => {
    const path = tree.paths[row.c] ?? [];
    return categories.some((slug) => path.includes(slug));
  });
}

const narrow = (rows, field, values) =>
  values?.length ? rows.filter((row) => values.includes(row[field])) : rows;

/**
 * The options each list should offer for `selection`.
 * @param {FacetTree} tree
 * @param {{category?: string[], manufacturer?: string[], model?: string[]}} selection
 */
export function cascadeOptions(tree, selection) {
  const byCategory = rowsInCategories(tree, selection.category);
  const byManufacturer = narrow(byCategory, "m", selection.manufacturer);
  const byModel = narrow(byManufacturer, "md", selection.model);

  return {
    manufacturers: sorted(byCategory.map((row) => row.m)),
    models: sorted(byManufacturer.map((row) => row.md)),
    years: sorted(byModel.map((row) => row.y)),
  };
}

/**
 * Drops any ticked manufacturer, model or year that no longer belongs to the
 * levels above it. Applied top-down, so unticking a category can clear a
 * manufacturer, which in turn can clear its models and their years.
 */
export function pruneSelection(tree, selection) {
  const next = { ...selection };

  const manufacturers = cascadeOptions(tree, next).manufacturers;
  next.manufacturer = (next.manufacturer ?? []).filter((value) => manufacturers.includes(value));

  const models = cascadeOptions(tree, next).models;
  next.model = (next.model ?? []).filter((value) => models.includes(value));

  const years = cascadeOptions(tree, next).years;
  next.year = (next.year ?? []).filter((value) => years.includes(value));

  return next;
}

/**
 * Builds the facet tree from product rows (server side).
 * @param {{categories: string|null, manufacturer, model, year}[]} products
 * @param {{id: string, slug: string, parent_id: string|null}[]} flatCategories
 * @returns {FacetTree}
 */
export function buildFacetTree(products, flatCategories) {
  const byId = new Map(flatCategories.map((category) => [category.id, category]));

  const paths = {};
  const pathFor = (id) => {
    if (!id || paths[id]) return;
    const slugs = [];
    let current = byId.get(id);
    while (current) {
      slugs.unshift(current.slug);
      current = current.parent_id ? byId.get(current.parent_id) : null;
    }
    paths[id] = slugs;
  };

  const seen = new Set();
  const rows = [];
  for (const product of products) {
    const row = {
      c: product.categories ?? null,
      m: product.manufacturer ?? null,
      md: product.model ?? null,
      y: product.year ?? null,
    };
    const key = `${row.c}|${row.m}|${row.md}|${row.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pathFor(row.c);
    rows.push(row);
  }

  return { rows, paths };
}
