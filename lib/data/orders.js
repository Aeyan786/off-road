import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin reads for orders and customers. These tables hold customer
 * personal data and are closed to the public API key (0009), so they're
 * read server-side with the service-role client. Callers must already have
 * checked admin permissions (proxy.js / requireAdmin).
 */

const ORDER_COLUMNS = `
  id, order_number, full_name, email, phone, shipping_address, billing_address,
  subtotal, shipping_cost, shipping_service, total, amount_paid, currency,
  status, payment_status, tracking_number,
  stripe_checkout_session_id, stripe_payment_intent_id,
  paid_at, shipped_at, delivered_at, cancelled_at, created_at,
  order_items ( id, product_id, product_name, sku, image, manufacturer, model, year, unit_price, quantity, line_total )
`;

/** Every order, newest first, with its item snapshots. */
export async function getOrders() {
  const { data, error } = await createAdminClient()
    .from("orders")
    .select(ORDER_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

const NEW_CUSTOMER_DAYS = 30;

/**
 * Every customer with order stats derived from their orders: count, first
 * and last order dates, total spent (excluding cancelled orders), and
 * whether they first ordered in the last NEW_CUSTOMER_DAYS days.
 */
export async function getCustomers() {
  const newSince = Date.now() - NEW_CUSTOMER_DAYS * 24 * 60 * 60 * 1000;
  const { data, error } = await createAdminClient()
    .from("customers")
    .select(
      "id, email, full_name, phone, shipping_address, billing_address, created_at, updated_at, orders ( total, status, created_at )"
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map(({ orders = [], ...customer }) => {
    const dates = orders.map((o) => o.created_at).sort();
    return {
      ...customer,
      orderCount: orders.length,
      firstOrderAt: dates[0] ?? null,
      lastOrderAt: dates[dates.length - 1] ?? null,
      isNew: new Date(customer.created_at).getTime() >= newSince,
      totalSpent: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0),
    };
  });
}
