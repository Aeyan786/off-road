/**
 * Shared reading of the storefront catalog's URL filters, so /products and
 * /new-arrivals interpret the same query string identically.
 */

export const EMPTY_FACETS = {
  suppliers: [],
  manufacturers: [],
  models: [],
  years: [],
  minPrice: 0,
  maxPrice: 0,
};

function toNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * The checkbox filters (supplier, manufacturer, model, year) can hold several
 * values, carried as repeated params (?model=A&model=B). Next gives a string
 * for one value and an array for several; this always returns an array
 * (empty values dropped, duplicates removed), so a single-value link such as
 * ?supplier=FMF%20Racing keeps working.
 */
export const MULTI_FILTER_KEYS = ["supplier", "manufacturer", "model", "year"];

/**
 * Categories are multi-value too, but they aren't passed to getProducts as
 * names: the slugs are resolved into category ids first
 * (getCategoryBranches), so they're tracked separately from the plain
 * value filters above.
 */
export const CATEGORY_FILTER_KEY = "category";

/** Every filter the rail keeps ticked state for. */
export const SELECTABLE_FILTER_KEYS = [CATEGORY_FILTER_KEY, ...MULTI_FILTER_KEYS];

export function toValueList(value) {
  const list = [].concat(value ?? []).map((v) => String(v).trim()).filter(Boolean);
  return [...new Set(list)];
}

/** Maps searchParams onto the filter shape getProducts() expects. */
export function readCatalogFilters(params = {}) {
  return {
    search: params.q?.trim() || undefined,
    supplier: toValueList(params.supplier),
    manufacturer: toValueList(params.manufacturer),
    model: toValueList(params.model),
    year: toValueList(params.year),
    minPrice: toNumber(params.min),
    maxPrice: toNumber(params.max),
  };
}
