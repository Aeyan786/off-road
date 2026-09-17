/**
 * Only `active` products are visible to shoppers. The column is plain text
 * with no database constraint, so the allowed values live here and in
 * lib/validation/product.js.
 */
export const ACTIVE_STATUS = "active";
export const PRODUCT_STATUSES = ["active", "draft"];

const PRODUCT_COLUMNS = `
  id,
  status,
  categories ( id, name, slug, parent:parent_id ( id, name, slug, parent:parent_id ( id, name, slug ) ) ),
  supplier,
  manufacturer,
  model,
  year,
  product,
  description,
  images,
  sku,
  width,
  length,
  height,
  weight_grams,
  price,
  discount_price,
  quantity,
  new_arrival,
  small_description,
  additional_information,
  created_at,
  updated_at
`;

/**
 * Single product query used by the admin listing, the storefront grid and
 * the category pages — all filters are optional and combine.
 *
 * @param {object} [filters]
 * @param {string} [filters.search] matches product name, SKU, manufacturer
 * @param {string} [filters.categoryId] exactly this category
 * @param {string[]} [filters.categoryIds] this category or any descendant
 * @param {string} [filters.manufacturer]
 * @param {string} [filters.model]
 * @param {string} [filters.year]
 * @param {number} [filters.minPrice]
 * @param {number} [filters.maxPrice]
 * @param {number} [filters.limit]
 * @param {boolean} [filters.newArrivalOnly] only products flagged as new arrivals
 * @param {boolean} [filters.includeAllStatuses] admin only — include drafts.
 *   Off by default so any new public caller is safe without remembering to
 *   filter.
 */
export async function getProducts(supabase, filters = {}) {
  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false });

  if (!filters.includeAllStatuses) {
    query = query.eq("status", ACTIVE_STATUS);
  }

  if (filters.newArrivalOnly) {
    query = query.eq("new_arrival", true);
  }

  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, "");
    query = query.or(
      `product.ilike.%${term}%,sku.ilike.%${term}%,manufacturer.ilike.%${term}%,supplier.ilike.%${term}%`
    );
  }

  if (filters.categoryId) {
    query = query.eq("categories", filters.categoryId);
  }

  if (filters.categoryIds?.length) {
    query = query.in("categories", filters.categoryIds);
  }

  for (const field of ["manufacturer", "model", "year"]) {
    if (filters[field]) query = query.eq(field, filters[field]);
  }

  if (Number.isFinite(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }
  if (Number.isFinite(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Distinct values that actually exist on products, for the storefront
 * filter dropdowns. One pass over the three columns, deduped in JS — same
 * approach as getDistinctSuppliers.
 */
export async function getProductFacets(supabase, options = {}) {
  let query = supabase
    .from("products")
    .select("manufacturer, model, year, price")
    .eq("status", ACTIVE_STATUS);

  // Scope the options to the page's base set, so New Arrivals never offers a
  // manufacturer that has no new arrivals.
  if (options.newArrivalOnly) {
    query = query.eq("new_arrival", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  const unique = (field) =>
    Array.from(
      new Set(data.map((row) => row[field]).filter((value) => value !== null && value !== ""))
    ).sort((a, b) => a.localeCompare(b));

  const prices = data.map((row) => Number(row.price)).filter(Number.isFinite);

  return {
    manufacturers: unique("manufacturer"),
    models: unique("model"),
    years: unique("year"),
    minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };
}

/**
 * @param {object} [options]
 * @param {boolean} [options.includeAllStatuses] admin only — lets the edit
 *   page open a draft. Public callers leave it off so a draft 404s.
 */
export async function getProductById(supabase, id, options = {}) {
  let query = supabase.from("products").select(PRODUCT_COLUMNS).eq("id", id);

  if (!options.includeAllStatuses) {
    query = query.eq("status", ACTIVE_STATUS);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Other products filed under the same category, excluding the one being
 * viewed. Returns an empty list when the product has no category.
 */
export async function getRelatedProducts(supabase, { categoryId, excludeId, limit = 4 }) {
  if (!categoryId) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", ACTIVE_STATUS)
    .eq("categories", categoryId)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/** Breadcrumb string ("ATV / ATV Exhaust / Slip-On") from an embedded category. */
export function categoryPath(category) {
  if (!category) return null;
  const parts = [category.name];
  let current = category;
  while (current.parent) {
    current = current.parent;
    parts.unshift(current.name);
  }
  return parts.join(" / ");
}

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Maps a DB product row to the shape ProductCard expects. */
export function toStorefrontProduct(row) {
  return {
    id: row.id,
    vendor: row.supplier || row.manufacturer || "",
    title: row.product,
    price: priceFormatter.format(row.price ?? 0),
    image: row.images?.[0] ?? null,
    year:row.year,
    model:row.model,
    manufacturer:row.manufacturer,
    discount_price:priceFormatter.format(row.discount_price ?? 0),
    // Cards show an "Out of stock" badge and disable their cart button.
    stock: row.quantity ?? 0,
  };
}

/** Distinct, non-empty supplier names actually present on products. */
export async function getDistinctSuppliers(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("supplier")
    .eq("status", ACTIVE_STATUS)
    .not("supplier", "is", null)
    .neq("supplier", "");

  if (error) throw error;

  return Array.from(new Set(data.map((row) => row.supplier))).sort((a, b) =>
    a.localeCompare(b)
  );
}
