import { shippingCountry } from "@/lib/shipping-countries";

/** { line1, city, county, postcode, country } -> display lines. */
export function addressLines(address) {
  if (!address) return [];
  return [
    address.line1,
    [address.city, address.county].filter(Boolean).join(", "),
    address.postcode,
    shippingCountry(address.country)?.name ?? address.country,
  ].filter(Boolean);
}

export function sameAddress(a, b) {
  return JSON.stringify(addressLines(a)) === JSON.stringify(addressLines(b));
}
