const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Shared storefront price formatting (matches the product pages). */
export function formatPrice(value) {
  return priceFormatter.format(Number(value ?? 0));
}
