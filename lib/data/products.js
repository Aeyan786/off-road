import { getAllCategoriesFlat } from "@/lib/data/categories";
import { buildFacetTree } from "@/lib/catalog-cascade";
import { getSupplierIdsByNames } from "@/lib/data/suppliers";

/**
 * Only `active` products are visible to shoppers. The column is plain text
 * with no database constraint, so the allowed values live here and in
 * lib/validation/product.js.
 */
export const ACTIVE_STATUS = "active";

/**
 * "New arrivals" is automatic and time-based: an active product counts as a
 * new arrival for NEW_ARRIVAL_DAYS after it was created, and the newest
 * NEW_ARRIVAL_COUNT of those are shown. A product therefore appears as soon
 * as it is imported or added in the admin — no flag to set — and drops out
 * on its own once it is older than the window.
 */
export const NEW_ARRIVAL_DAYS = 30;
export const NEW_ARRIVAL_COUNT = 12;

/** The oldest creation date still counted as a new arrival. */
export function newArrivalCutoff(now = new Date()) {
  return new Date(now.getTime() - NEW_ARRIVAL_DAYS * 24 * 60 * 60 * 1000);
}
export const PRODUCT_STATUSES = ["active", "draft"];

const PRODUCT_COLUMNS = `
  id,
  status,
  categories ( id, name, slug, parent:parent_id ( id, name, slug, parent:parent_id ( id, name, slug ) ) ),
  supplier_id,
  supplier_ref:supplier_id ( id, name ),
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
 * Products reference their supplier by id; the name comes from the joined
 * suppliers row. Exposing it as `supplier` keeps every consumer (cards,
 * product page, admin form) working with a plain name string.
 */
function withSupplierName(row) {
  if (!row) return row;
  const { supplier_ref, ...rest } = row;
  return { ...rest, supplier: supplier_ref?.name ?? null };
}

/** One value or several -> a clean array ("" and duplicates dropped). */
function valueList(value) {
  return [...new Set([].concat(value ?? []).map((v) => String(v).trim()).filter(Boolean))];
}

/** Text columns the storefront search looks inside. */
const SEARCH_COLUMNS = [
  "product",
  "small_description",
  "description",
  "model",
  "year",
  "additional_information",
];

/**
 * Normalises a raw search string for use inside a PostgREST `or` filter.
 * The value is double-quoted there, so commas/brackets are safe; quotes,
 * backslashes and the LIKE wildcards (% and PostgREST's *) are dropped so
 * they can't break the filter or turn into wildcards.
 */
function toSearchTerm(raw) {
  if (typeof raw !== "string") return "";
  return raw.replace(/["\\%*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

/** Ids of categories whose name contains `term`, plus all their descendants. */
async function getCategoryIdsMatching(supabase, term) {
  const flat = await getAllCategoriesFlat(supabase);
  const needle = term.toLowerCase();

  const ids = new Set(
    flat.filter((c) => c.name.toLowerCase().includes(needle)).map((c) => c.id)
  );
  let grew = ids.size > 0;
  while (grew) {
    grew = false;
    for (const c of flat) {
      if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
        ids.add(c.id);
        grew = true;
      }
    }
  }
  return [...ids];
}

/**
 * Single product query used by the admin listing, the storefront grid and
 * the category pages — all filters are optional and combine.
 *
 * @param {object} [filters]
 * @param {string} [filters.search] case-insensitive substring match against
 *   name, short/long description, category, model, year and additional info
 * @param {string} [filters.categoryId] exactly this category
 * @param {string[]} [filters.categoryIds] this category or any descendant
 * @param {string|string[]} [filters.supplier] supplier name(s),
 *   case-insensitive, as carried in storefront URLs
 * @param {string|string[]} [filters.manufacturer]
 * @param {string|string[]} [filters.model]
 * @param {string|string[]} [filters.year]
 *   Each of these four accepts one value or several. Several values of the
 *   same filter match ANY of them; different filters must ALL match.
 * @param {number} [filters.minPrice]
 * @param {number} [filters.maxPrice]
 * @param {number} [filters.limit]
 * @param {boolean} [filters.newArrivalOnly] only products flagged as new arrivals
 * @param {boolean} [filters.newArrivalsOnly] restrict to the current new
 *   arrivals (see NEW_ARRIVAL_DAYS), so the page's other filters apply
 *   within that set rather than across the whole catalogue
 * @param {boolean} [filters.includeAllStatuses] admin only — include drafts.
 *   Off by default so any new public caller is safe without remembering to
 *   filter.
 */
/**
 * Ids of the products currently qualifying as new arrivals: active, created
 * inside the window, newest first, capped at NEW_ARRIVAL_COUNT.
 */
async function newArrivalIds(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("status", ACTIVE_STATUS)
    .gte("created_at", newArrivalCutoff().toISOString())
    .order("created_at", { ascending: false })
    .limit(NEW_ARRIVAL_COUNT);

  if (error) throw error;
  return data.map((row) => row.id);
}

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

  if (filters.newArrivalsOnly) {
    const ids = await newArrivalIds(supabase);
    if (ids.length === 0) return [];
    query = query.in("id", ids);
  }

  const term = toSearchTerm(filters.search);
  if (term) {
    // `_` is LIKE's single-character wildcard; escape it (\_, with the
    // backslash itself escaped for PostgREST's quoted value) so it's literal.
    const pattern = term.replace(/_/g, "\\\\_");
    const clauses = SEARCH_COLUMNS.map((column) => `${column}.ilike."%${pattern}%"`);

    // The category is a foreign key, so its name can't be matched inside the
    // same filter — resolve matching categories (and everything beneath
    // them, as category browsing does) to ids first.
    const categoryIds = await getCategoryIdsMatching(supabase, term);
    if (categoryIds.length > 0) {
      clauses.push(`categories.in.(${categoryIds.join(",")})`);
    }

    query = query.or(clauses.join(","));
  }

  if (filters.categoryId) {
    query = query.eq("categories", filters.categoryId);
  }

  if (filters.categoryIds?.length) {
    query = query.in("categories", filters.categoryIds);
  }

  const suppliers = valueList(filters.supplier);
  if (suppliers.length > 0) {
    const supplierIds = await getSupplierIdsByNames(supabase, suppliers);
    // Unknown suppliers match nothing rather than being ignored.
    if (supplierIds.length === 0) return [];
    query = query.in("supplier_id", supplierIds);
  }

  for (const field of ["manufacturer", "model", "year"]) {
    const values = valueList(filters[field]);
    if (values.length === 1) query = query.eq(field, values[0]);
    else if (values.length > 1) query = query.in(field, values);
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
  return data.map(withSupplierName);
}

/**
 * Distinct values that actually exist on products, for the storefront
 * filter dropdowns. One pass over the three columns, deduped in JS — same
 * approach as getDistinctSuppliers.
 */
export async function getProductFacets(supabase, options = {}) {
  let query = supabase
    .from("products")
    .select("supplier_ref:supplier_id ( name ), categories, manufacturer, model, year, price")
    .eq("status", ACTIVE_STATUS);

  // Scope the options to the page's base set, so New arrivals never offers a
  // manufacturer that has no new arrivals.
  if (options.newArrivalOnly) {
    query = query.eq("new_arrival", true);
  }

  if (options.newArrivalsOnly) {
    const ids = await newArrivalIds(supabase);
    if (ids.length === 0) {
      return { suppliers: [], manufacturers: [], models: [], years: [], minPrice: 0, maxPrice: 0, tree: { rows: [], paths: {} } };
    }
    query = query.in("id", ids);
  }

  const [{ data, error }, flatCategories] = await Promise.all([
    query,
    getAllCategoriesFlat(supabase),
  ]);
  if (error) throw error;

  const rows = data.map(withSupplierName);
  const unique = (field) =>
    Array.from(
      new Set(rows.map((row) => row[field]).filter((value) => value !== null && value !== ""))
    ).sort((a, b) => a.localeCompare(b));

  const prices = rows.map((row) => Number(row.price)).filter(Number.isFinite);

  return {
    suppliers: unique("supplier"),
    manufacturers: unique("manufacturer"),
    models: unique("model"),
    years: unique("year"),
    minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
    maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
    // Distinct category/manufacturer/model/year combinations, from which
    // the filter rail derives its cascading lists (lib/catalog-cascade.js).
    tree: buildFacetTree(rows, flatCategories),
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
  return withSupplierName(data);
}

/**
 * Other products filed under the same category, excluding the one being
 * viewed. Returns an empty list when the product has no category.
 */
/**
 * "You may also like": other parts for the SAME machine — identical
 * manufacturer, model and year. Anything else would be a part for a
 * different machine, so when the product is the only one for its machine
 * (or is missing any of the three attributes) this returns nothing and the
 * section is hidden rather than filled with unrelated parts.
 */
export async function getRelatedProducts(supabase, { manufacturer, model, year, excludeId, limit = 4 }) {
  if (!manufacturer || !model || !year) return [];

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("status", ACTIVE_STATUS)
    .eq("manufacturer", manufacturer)
    .eq("model", model)
    .eq("year", year)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.map(withSupplierName);
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
/**
 * Full product title: manufacturer, model and year in front of the product
 * name, exactly as the cards show it. Missing attributes are skipped rather
 * than printed as blanks, so a product without a year still reads cleanly.
 */
export function productTitle(row) {
  return [row.manufacturer, row.model, row.year, row.product]
    .map((part) => (part === null || part === undefined ? "" : String(part).trim()))
    .filter(Boolean)
    .join(" ");
}

export function toStorefrontProduct(row) {
  return {
    id: row.id,
    vendor: row.supplier || row.manufacturer || "",
    title: row.product,
    fullTitle: productTitle(row),
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

/**
 * Names of suppliers that have at least one active product — the header
 * vendor menus only offer suppliers a shopper can actually browse.
 */
export async function getDistinctSuppliers(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("supplier_ref:supplier_id ( name )")
    .eq("status", ACTIVE_STATUS)
    .not("supplier_id", "is", null);

  if (error) throw error;

  return Array.from(
    new Set(data.map((row) => row.supplier_ref?.name).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}
