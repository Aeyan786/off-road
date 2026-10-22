/**
 * Drill-down rules for the catalogue's category filter.
 *
 * The URL holds the most specific categories the shopper has chosen, and
 * the products query matches each one's whole branch (getCategoryBranches).
 * Because branches are combined with "any of", an ancestor and one of its
 * descendants must never both be selected — the ancestor would swallow the
 * narrower choice. So:
 *
 *   tick a category      → it replaces any ticked ancestor (narrowing)
 *   tick several siblings → they combine
 *   untick a category    → it and anything beneath it go; if nothing else
 *                          is left under its parent, the parent is ticked
 *                          again ("back to the whole parent")
 *   untick a top level   → everything beneath it goes
 *
 * A category counts as ticked (and stays open in the filter) when it, or
 * anything beneath it, is selected.
 *
 * Pure and dependency-free: works on the server and in the browser.
 */

/**
 * @param {{slug: string, name: string, children?: object[]}[]} tree
 * @returns {Map<string, {slug, name, parent: string|null, children: string[], descendants: Set<string>}>}
 */
export function indexCategoryTree(tree = []) {
  const index = new Map();

  const visit = (node, parent) => {
    const children = node.children ?? [];
    const entry = {
      slug: node.slug,
      name: node.name,
      parent,
      children: children.map((child) => child.slug),
      descendants: new Set(),
    };
    index.set(node.slug, entry);

    for (const child of children) {
      visit(child, node.slug);
      entry.descendants.add(child.slug);
      for (const slug of index.get(child.slug).descendants) entry.descendants.add(slug);
    }
  };

  for (const root of tree) visit(root, null);
  return index;
}

function ancestorsOf(index, slug) {
  const ancestors = [];
  let parent = index.get(slug)?.parent ?? null;
  while (parent) {
    ancestors.push(parent);
    parent = index.get(parent)?.parent ?? null;
  }
  return ancestors;
}

/** Ticked, or something beneath it is. */
export function isCategoryActive(index, slug, selected = []) {
  if (selected.includes(slug)) return true;
  const descendants = index.get(slug)?.descendants;
  return Boolean(descendants && selected.some((value) => descendants.has(value)));
}

/**
 * The next list of selected slugs after ticking or unticking `slug`.
 * Unknown slugs (e.g. from an old link) are left alone.
 */
export function toggleCategory(index, selected = [], slug, checked) {
  const node = index.get(slug);
  if (!node) return selected;

  if (checked) {
    const ancestors = new Set(ancestorsOf(index, slug));
    const next = selected.filter((value) => !ancestors.has(value) && !node.descendants.has(value));
    return [...new Set([...next, slug])];
  }

  const next = selected.filter((value) => value !== slug && !node.descendants.has(value));

  // Unticking the last choice inside a parent goes back to the whole parent.
  if (node.parent && !isCategoryActive(index, node.parent, next)) {
    next.push(node.parent);
  }
  return next;
}
