import { createAdminClient } from "@/lib/supabase/admin";
import { getSalesReport, getInventoryReport } from "@/lib/data/reports";
import { getVisitorReport } from "@/lib/data/analytics";
import { getOrders, getCustomers } from "@/lib/data/orders";

/**
 * The admin dashboard overview. Nothing here re-implements business logic:
 * sales, inventory and visitor figures come from the same functions the
 * Reports and Analytics pages use, so the numbers always agree.
 *
 * Sections are fetched only when the signed-in admin can open the module
 * they belong to (`can`), and all of them run in parallel.
 */
export async function getDashboard(period, can) {
  const [sales, inventory, visitors, orders, customers, recent] = await Promise.all([
    can("orders") ? getSalesReport(period).catch(() => null) : null,
    can("products") ? getInventoryReport(period).catch(() => null) : null,
    can("analytics") ? getVisitorReport(period).catch(() => null) : null,
    can("orders") ? getOrders().catch(() => []) : [],
    can("customers") ? getCustomers().catch(() => []) : [],
    recentActivity(can),
  ]);

  return {
    sales,
    inventory,
    visitors,
    orders: orders ? summarizeOrders(orders) : null,
    customers: customers.length
      ? {
          total: customers.length,
          newThisMonth: customers.filter((c) => c.isNew).length,
          recent: customers.slice(0, 5),
        }
      : can("customers")
        ? { total: 0, newThisMonth: 0, recent: [] }
        : null,
    products: inventory ? summarizeProducts(inventory.rows) : null,
    recent,
  };
}

/** All-time order counts by status, plus the five newest orders. */
function summarizeOrders(orders) {
  const counts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0 };
  let revenue = 0;
  for (const order of orders) {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
    if (!["cancelled", "refunded"].includes(order.status)) revenue += Number(order.amount_paid ?? 0);
  }
  return { total: orders.length, counts, revenue, recent: orders.slice(0, 5) };
}

/** Catalogue counts by publish status, from the inventory report's rows. */
function summarizeProducts(rows) {
  const counts = {};
  for (const row of rows) counts[row.status] = (counts[row.status] ?? 0) + 1;
  return {
    total: rows.length,
    active: counts.active ?? 0,
    draft: counts.draft ?? 0,
    archived: counts.archived ?? 0,
  };
}

/** Newest products and blogs, for the activity column. */
async function recentActivity(can) {
  const admin = createAdminClient();
  const [products, blogs] = await Promise.all([
    can("products")
      ? admin
          .from("products")
          .select("id, product, sku, status, quantity, price, discount_price, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
          .then(({ data }) => data ?? [])
          .catch(() => [])
      : [],
    can("blogs")
      ? admin
          .from("blogs")
          .select("id, title, slug, status, published_at, created_at")
          .order("created_at", { ascending: false })
          .limit(5)
          .then(({ data }) => data ?? [])
          .catch(() => [])
      : [],
  ]);
  return { products, blogs };
}
