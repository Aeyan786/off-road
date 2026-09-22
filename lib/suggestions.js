/**
 * Builds the homepage "Suggested For You" tabs from real product/category
 * data — nothing hard-coded. Tabs are "All" plus the categories (at whatever
 * level products are filed) holding the most products. Products already
 * shown elsewhere on the page are skipped where possible, so the section
 * surfaces something new; they're only used to top a tab up if it runs short.
 *
 * @param {object[]} products active product rows, newest first
 * @param {object} [options]
 * @param {Set<string>} [options.exclude] product ids already on the page
 * @param {number} [options.maxTabs] category tabs besides "All"
 * @param {number} [options.perTab] products per tab
 * @returns {{key: string, label: string, slug?: string, products: object[]}[]}
 */
export function buildSuggestionTabs(products, { exclude = new Set(), maxTabs = 4, perTab = 8 } = {}) {
  const pick = (pool) => {
    const fresh = pool.filter((p) => !exclude.has(p.id));
    const seen = pool.filter((p) => exclude.has(p.id));
    return [...fresh, ...seen].slice(0, perTab);
  };

  const byCategory = new Map();
  for (const product of products) {
    const category = product.categories;
    if (!category?.id) continue;
    if (!byCategory.has(category.id)) {
      byCategory.set(category.id, {
        key: category.id,
        label: category.name,
        slug: category.slug,
        products: [],
      });
    }
    byCategory.get(category.id).products.push(product);
  }

  const categoryTabs = [...byCategory.values()]
    .sort((a, b) => b.products.length - a.products.length || a.label.localeCompare(b.label))
    .slice(0, maxTabs)
    .map((tab) => ({ ...tab, products: pick(tab.products) }));

  const all = { key: "all", label: "All", products: pick(products) };
  return all.products.length > 0 ? [all, ...categoryTabs] : [];
}
