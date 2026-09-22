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
