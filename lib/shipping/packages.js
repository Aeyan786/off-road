/**
 * Turns priced cart items into the packages UPS is asked to rate.
 *
 * Today every order is rated as the combined weight of its items. There is
 * deliberately no packing logic here yet — no dimensions, no splitting, no
 * grouping rules — but this is the single place that work belongs: return
 * more entries from this function and the UPS request, the options UI and
 * the checkout all follow without further change.
 */

/** UPS rejects a zero weight, so a rated package is never lighter than this. */
const MIN_PACKAGE_KG = 0.1;

/** Combined weight of the cart, in kilograms. */
export function totalWeightKg(items) {
  const grams = items.reduce(
    (sum, item) => sum + Number(item.weight_grams ?? 0) * item.quantity,
    0
  );
  return Math.round((grams / 1000) * 10) / 10;
}

/**
 * @param {{weight_grams: number|null, quantity: number}[]} items
 * @returns {{weightKg: number}[]}
 */
export function buildPackages(items) {
  return [{ weightKg: Math.max(totalWeightKg(items), MIN_PACKAGE_KG) }];
}
