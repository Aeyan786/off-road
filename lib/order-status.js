/**
 * Order status workflow — mirrors the orders_guard_status() trigger in
 * 0009_orders_checkout.sql, which is what actually enforces it:
 *
 *   pending -> shipped (tracking number required) -> delivered
 *   pending -> cancelled
 *   delivered / cancelled are final.
 */
export const ORDER_STATUSES = {
  pending: { label: "Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
  shipped: { label: "Shipped", className: "border-sky-200 bg-sky-50 text-sky-700" },
  delivered: { label: "Delivered", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

export const PAYMENT_STATUSES = {
  paid: { label: "Paid", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  refunded: { label: "Refunded", className: "border-neutral-200 bg-neutral-100 text-neutral-600" },
};

export const FINAL_STATUSES = ["delivered", "cancelled"];

/** Which actions an order in `status` allows. */
export function allowedActions(status) {
  return {
    ship: status === "pending",
    cancel: status === "pending",
    deliver: status === "shipped",
    isFinal: FINAL_STATUSES.includes(status),
  };
}

export function formatOrderNumber(orderNumber) {
  return `#${orderNumber}`;
}
