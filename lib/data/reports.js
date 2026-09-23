import { createAdminClient } from "@/lib/supabase/admin";
import { bucketKey } from "@/lib/reports/period";
import { isLowStock, isOutOfStock, LOW_STOCK_THRESHOLD } from "@/lib/inventory";
import { categoryPath } from "@/lib/data/products";

/**
 * Report data, computed from real orders and products (service-role reads —
 * orders hold customer data). All money figures are GBP.
 *
 * Sales definitions (used consistently across cards, chart and tables):
 *   - an order counts in the period its payment was confirmed (orders.paid_at)
 *   - revenue = amount Stripe actually charged (orders.amount_paid)
 *   - cancelled orders are excluded from revenue/orders/items and reported
 *     separately (refunds are issued manually in Stripe)
 */

const ORDER_COLUMNS = `
  id, order_number, full_name, email, status, payment_status, amount_paid, total,
  subtotal, shipping_cost, paid_at, shipping_address,
  order_items ( product_id, product_name, sku, quantity, line_total )
`;

async function ordersBetween(start, end) {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select(ORDER_COLUMNS)
    .gte("paid_at", start.toISOString())
    .lt("paid_at", end.toISOString())
    .order("paid_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

function summarize(orders) {
  const live = orders.filter((o) => !["cancelled", "refunded"].includes(o.status));
  const cancelled = orders.filter((o) => ["cancelled", "refunded"].includes(o.status));
  const revenue = live.reduce((s, o) => s + Number(o.amount_paid), 0);
  const items = live.reduce((s, o) => s + o.order_items.reduce((n, i) => n + i.quantity, 0), 0);
  return {
    revenue,
    orders: live.length,
    items,
    averageOrderValue: live.length ? revenue / live.length : 0,
    cancelledOrders: cancelled.length,
    cancelledValue: cancelled.reduce((s, o) => s + Number(o.amount_paid), 0),
  };
}

const change = (current, previous) => (previous > 0 ? (current - previous) / previous : null);

export async function getSalesReport(period) {
  const [current, previous] = await Promise.all([
    ordersBetween(period.start, period.end),
    ordersBetween(period.previous.start, period.previous.end),
  ]);

  const totals = summarize(current);
  const prior = summarize(previous);

  // Revenue/orders per chart bucket (UK time).
  const byBucket = new Map(period.buckets.map((b) => [b.key, { ...b, revenue: 0, orders: 0, items: 0 }]));
  for (const order of current) {
    if (order.status === "cancelled") continue;
    const bucket = byBucket.get(bucketKey(period.type, order.paid_at));
    if (!bucket) continue;
    bucket.revenue += Number(order.amount_paid);
    bucket.orders += 1;
    bucket.items += order.order_items.reduce((n, i) => n + i.quantity, 0);
  }

  // Top products from the purchase-time snapshots.
  const products = new Map();
  for (const order of current) {
    if (order.status === "cancelled") continue;
    for (const item of order.order_items) {
      const key = item.product_id ?? `${item.product_name}|${item.sku}`;
      const row = products.get(key) ?? { key, name: item.product_name, sku: item.sku, quantity: 0, revenue: 0, orders: 0 };
      row.quantity += item.quantity;
      row.revenue += Number(item.line_total);
      row.orders += 1;
      products.set(key, row);
    }
  }

  const statusCounts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const countries = new Map();
  for (const order of current) {
    statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
    if (order.status === "cancelled") continue;
    const code = order.shipping_address?.country ?? "—";
    const row = countries.get(code) ?? { code, orders: 0, revenue: 0 };
    row.orders += 1;
    row.revenue += Number(order.amount_paid);
    countries.set(code, row);
  }

  return {
    totals,
    previous: prior,
    changes: {
      revenue: change(totals.revenue, prior.revenue),
      orders: change(totals.orders, prior.orders),
      items: change(totals.items, prior.items),
      averageOrderValue: change(totals.averageOrderValue, prior.averageOrderValue),
    },
    series: [...byBucket.values()],
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue),
    statusCounts,
    countries: [...countries.values()].sort((a, b) => b.revenue - a.revenue),
    orders: current,
  };
}

/**
 * Inventory is a snapshot of products *now* (there's no stock-history
 * table); the period only drives movement figures derived from orders:
 * units sold, products added, and days of stock left at that selling rate.
 */
export async function getInventoryReport(period) {
  const admin = createAdminClient();
  const [{ data: products, error }, orders] = await Promise.all([
    admin
      .from("products")
      .select(
        "id, product, sku, status, quantity, price, discount_price, created_at, supplier_ref:supplier_id ( name ), categories ( id, name, parent:parent_id ( id, name, parent:parent_id ( id, name ) ) )"
      )
      .order("product", { ascending: true }),
    ordersBetween(period.start, period.end),
  ]);
  if (error) throw new Error(error.message);

  const sold = new Map();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.order_items) {
      if (item.product_id) sold.set(item.product_id, (sold.get(item.product_id) ?? 0) + item.quantity);
    }
  }

  const rows = products.map((p) => {
    const quantity = Math.max(0, p.quantity ?? 0);
    const unitPrice = Number(p.discount_price ?? p.price ?? 0);
    const soldInPeriod = sold.get(p.id) ?? 0;
    const perDay = soldInPeriod / period.days;
    return {
      id: p.id,
      name: p.product,
      sku: p.sku,
      status: p.status,
      supplier: p.supplier_ref?.name ?? "—",
      category: categoryPath(p.categories) ?? "Uncategorised",
      topCategory: categoryPath(p.categories)?.split(" / ")[0] ?? "Uncategorised",
      quantity,
      unitPrice,
      value: quantity * unitPrice,
      stockStatus: isOutOfStock(quantity) ? "out" : isLowStock(quantity) ? "low" : "in",
      soldInPeriod,
      daysOfStock: perDay > 0 ? quantity / perDay : null,
      addedInPeriod: new Date(p.created_at) >= period.start && new Date(p.created_at) < period.end,
    };
  });

  const group = (key) => {
    const map = new Map();
    for (const r of rows) {
      const g = map.get(r[key]) ?? { name: r[key], products: 0, units: 0, value: 0, low: 0, out: 0, sold: 0 };
      g.products += 1;
      g.units += r.quantity;
      g.value += r.value;
      g.sold += r.soldInPeriod;
      if (r.stockStatus === "low") g.low += 1;
      if (r.stockStatus === "out") g.out += 1;
      map.set(r[key], g);
    }
    return [...map.values()].sort((a, b) => b.value - a.value);
  };

  const count = (s) => rows.filter((r) => r.stockStatus === s).length;
  return {
    threshold: LOW_STOCK_THRESHOLD,
    totals: {
      products: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      inStock: count("in"),
      lowStock: count("low"),
      outOfStock: count("out"),
      units: rows.reduce((s, r) => s + r.quantity, 0),
      value: rows.reduce((s, r) => s + r.value, 0),
      unitsSold: rows.reduce((s, r) => s + r.soldInPeriod, 0),
      productsSold: rows.filter((r) => r.soldInPeriod > 0).length,
      productsAdded: rows.filter((r) => r.addedInPeriod).length,
    },
    byCategory: group("topCategory"),
    bySupplier: group("supplier"),
    rows,
  };
}
