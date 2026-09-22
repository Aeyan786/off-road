/**
 * Where we ship: the UK, the EU, the EEA (Norway, Iceland, Liechtenstein),
 * Switzerland, the US and Canada. Used by the checkout form's country list
 * and by server-side address validation, so both always agree.
 *
 * `postcode` validates the format (case-insensitive, spaces allowed);
 * `regionLabel` names the county/state field, and `regionRequired` marks the
 * countries whose couriers need it (US states, Canadian provinces).
 */

// Generic European format check: 3–10 letters/digits with optional spaces
// or hyphens (e.g. "75008", "1010", "D02 X285", "LV-1050").
const EUROPEAN_POSTCODE = /^[A-Z0-9][A-Z0-9 -]{1,8}[A-Z0-9]$/i;

const EUROPE = [
  ["AT", "Austria"],
  ["BE", "Belgium"],
  ["BG", "Bulgaria"],
  ["HR", "Croatia"],
  ["CY", "Cyprus"],
  ["CZ", "Czechia"],
  ["DK", "Denmark"],
  ["EE", "Estonia"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["GR", "Greece"],
  ["HU", "Hungary"],
  ["IS", "Iceland"],
  ["IE", "Ireland"],
  ["IT", "Italy"],
  ["LV", "Latvia"],
  ["LI", "Liechtenstein"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["MT", "Malta"],
  ["NL", "Netherlands"],
  ["NO", "Norway"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["RO", "Romania"],
  ["SK", "Slovakia"],
  ["SI", "Slovenia"],
  ["ES", "Spain"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
].map(([code, name]) => ({
  code,
  name,
  postcode: EUROPEAN_POSTCODE,
  regionLabel: "County / Region (optional)",
  regionRequired: false,
}));

export const SHIPPING_COUNTRIES = [
  {
    code: "GB",
    name: "United Kingdom",
    // UK postcode, e.g. "CH66 1PS", "SW1A 1AA", "M1 1AE".
    postcode: /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i,
    regionLabel: "County (optional)",
    regionRequired: false,
  },
  {
    code: "US",
    name: "United States",
    // ZIP or ZIP+4, e.g. "90210", "90210-1234".
    postcode: /^\d{5}(-\d{4})?$/,
    regionLabel: "State",
    regionRequired: true,
  },
  {
    code: "CA",
    name: "Canada",
    // e.g. "K1A 0B1".
    postcode: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]\s?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    regionLabel: "Province / Territory",
    regionRequired: true,
  },
  ...EUROPE,
];

export const DEFAULT_COUNTRY_CODE = "GB";

const byCode = new Map(SHIPPING_COUNTRIES.map((c) => [c.code, c]));

/** The shipping country for an ISO code, or null if we don't ship there. */
export function shippingCountry(code) {
  return byCode.get(String(code ?? "").toUpperCase()) ?? null;
}
