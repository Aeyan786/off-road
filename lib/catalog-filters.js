/**
 * Shared reading of the storefront catalog's URL filters, so /products and
 * /new-arrivals interpret the same query string identically.
 */

export const EMPTY_FACETS = {
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

/** Maps searchParams onto the filter shape getProducts() expects. */
export function readCatalogFilters(params = {}) {
  return {
    manufacturer: params.manufacturer,
    model: params.model,
    year: params.year,
    minPrice: toNumber(params.min),
    maxPrice: toNumber(params.max),
  };
}
