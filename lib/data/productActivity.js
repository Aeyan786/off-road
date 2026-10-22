import { createAdminClient } from "@/lib/supabase/admin";
import { NON_SALE_STATUSES } from "@/lib/order-status";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Units of one product sold in the rolling 24 hours before now — not "today".
 *
 * A sale is an order line whose order was paid (orders.paid_at) inside the
 * window and has not been cancelled or refunded; quantities are summed, so
 * three units in one order count as three. There are no product variants:
 * order lines point straight at the product.
 *
 * Read with the service role because orders hold customer data and are
 * closed to the public key; callers only ever pass the resulting number on.
 *
 * @returns {Promise<number>}
 */
export async function getUnitsSoldLast24h(productId, now = new Date()) {
  const since = new Date(now.getTime() - DAY_MS).toISOString();

  // Bounded on both sides, so this is exactly the 24 hours before `now`.
  const { data, error } = await createAdminClient()
    .from("order_items")
    .select("quantity, orders!inner ( status, paid_at )")
    .eq("product_id", productId)
    .gte("orders.paid_at", since)
    .lte("orders.paid_at", now.toISOString())
    .not("orders.status", "in", `(${NON_SALE_STATUSES.join(",")})`);

  if (error) throw new Error(error.message);
  return data.reduce((total, line) => total + (line.quantity ?? 0), 0);
}
