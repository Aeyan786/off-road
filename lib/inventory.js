/**
 * Stock rules shared by the admin. Out of stock = 0 units; low stock = at
 * least 1 but no more than LOW_STOCK_THRESHOLD units.
 */
export const LOW_STOCK_THRESHOLD = 5;

export function isOutOfStock(quantity) {
  return (quantity ?? 0) <= 0;
}

export function isLowStock(quantity) {
  const qty = quantity ?? 0;
  return qty > 0 && qty <= LOW_STOCK_THRESHOLD;
}

/**
 * Inventory summary for the products listing, derived from product rows
 * (any status). Stock value uses the selling price — the discount price
 * when set, as the cart does.
 */
export function summarizeInventory(products) {
  const summary = {
    total: products.length,
    active: 0,
    draft: 0,
    lowStock: 0,
    outOfStock: 0,
    units: 0,
    stockValue: 0,
  };

  for (const product of products) {
    const qty = Math.max(0, product.quantity ?? 0);
    if (product.status === "active") summary.active += 1;
    else summary.draft += 1;
    if (isOutOfStock(qty)) summary.outOfStock += 1;
    else if (isLowStock(qty)) summary.lowStock += 1;
    summary.units += qty;
    summary.stockValue += qty * Number(product.discount_price ?? product.price ?? 0);
  }

  return summary;
}
