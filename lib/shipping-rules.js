/**
 * Free-delivery rule, in one place so the announcement bar, the cart, the
 * checkout and the shipping quote can never disagree about it.
 *
 * Orders whose product subtotal reaches the threshold ship free; below it
 * the customer pays the UPS service they choose at checkout. The threshold
 * is applied to the product subtotal (before shipping), and reaching it
 * exactly qualifies.
 */
export const FREE_DELIVERY_THRESHOLD = 250;

export const FREE_DELIVERY_LABEL = "Free delivery on all orders over £250.00";

/** True when `subtotal` (GBP) qualifies for free delivery. */
export function qualifiesForFreeDelivery(subtotal) {
  return Number(subtotal ?? 0) >= FREE_DELIVERY_THRESHOLD;
}

/** How much more a basket needs to qualify; 0 once it does. */
export function remainingForFreeDelivery(subtotal) {
  const remaining = FREE_DELIVERY_THRESHOLD - Number(subtotal ?? 0);
  return remaining > 0 ? Math.round(remaining * 100) / 100 : 0;
}

/** 0–1 progress towards the threshold, for the cart's delivery indicator. */
export function freeDeliveryProgress(subtotal) {
  const ratio = Number(subtotal ?? 0) / FREE_DELIVERY_THRESHOLD;
  return Math.max(0, Math.min(1, ratio));
}
