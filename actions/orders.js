"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_STATUSES } from "@/lib/order-status";

/**
 * Order status changes. Each update is conditional on the order's current
 * status, and the database trigger (orders_guard_status) independently
 * refuses any illegal move — so delivered/cancelled orders can't change
 * even if these actions were called directly.
 */

function revalidateOrderViews() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/products");
}

/**
 * Moves order `id` from `from` to `to` with extra `fields`. Reports the
 * order's real current status when it wasn't in `from` any more.
 */
async function transition(id, from, to, fields = {}) {
  const { error: authError } = await requireAdmin("orders");
  if (authError) return { error: authError };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({ status: to, ...fields })
    .eq("id", id)
    .eq("status", from)
    .select("id, order_number, status");

  if (error) {
    // P0001 = raised by the status trigger; its message is already readable.
    return { error: error.code === "P0001" || error.code === "23514" ? error.message : `Couldn't update the order: ${error.message}` };
  }

  if (!data?.length) {
    const { data: current } = await admin.from("orders").select("status").eq("id", id).maybeSingle();
    if (!current) return { error: "This order no longer exists." };
    return {
      error: `This order is already ${ORDER_STATUSES[current.status]?.label.toLowerCase() ?? current.status}; refresh to see its latest status.`,
    };
  }

  revalidateOrderViews();
  return { success: true, order: data[0] };
}

/** Pending -> Shipped. The tracking number is required and stored. */
export async function shipOrder(id, trackingNumber) {
  const tracking = String(trackingNumber ?? "").trim();
  if (!tracking) return { error: "Enter the tracking number." };
  if (tracking.length > 100) return { error: "Tracking number must be 100 characters or fewer." };
  return transition(id, "pending", "shipped", { tracking_number: tracking });
}

/** Shipped -> Delivered (final). */
export async function deliverOrder(id) {
  return transition(id, "shipped", "delivered");
}

/** Pending -> Cancelled (final). Stock is restored by a database trigger. */
export async function cancelOrder(id) {
  return transition(id, "pending", "cancelled");
}
