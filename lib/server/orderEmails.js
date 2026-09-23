import { createAdminClient } from "@/lib/supabase/admin";
import { fromAddress, getResend } from "@/lib/email/client";
import { renderOrderEmail } from "@/lib/email/order-templates";
import { getEmailSettingsOrDefaults } from "@/lib/data/emailTemplates";

/**
 * One email per order per kind, sent at most once:
 *   placed    — to the customer, after the Stripe webhook creates the order
 *   received  — to the shop's admin address, for the same new order
 *   shipped   — after an admin marks it shipped (includes tracking number)
 *   delivered — after an admin marks it delivered
 *   cancelled — to the customer, when an admin cancels the order
 *   refunded  — to the customer, when an admin marks the order refunded
 *
 * Before sending, the email is "claimed" by setting its *_email_sent_at
 * column only where it is still null (and only while the order is in the
 * matching status). A second attempt finds nothing to claim and sends
 * nothing. If Resend fails the claim is released so it can be retried, and
 * Resend's idempotency key guards against a double send in the gap.
 */
const KINDS = {
  placed: { column: "placed_email_sent_at", statuses: ["pending", "shipped", "delivered"], template: "order_placed" },
  shipped: { column: "shipped_email_sent_at", statuses: ["shipped"], template: "order_shipped" },
  delivered: { column: "delivered_email_sent_at", statuses: ["delivered"], template: "order_delivered" },
  // Admin notification for a new paid order — fixed recipient, not the customer.
  received: {
    column: "received_email_sent_at",
    statuses: ["pending", "shipped", "delivered"],
    template: "order_recieved",
    to: () => process.env.ADMIN_ORDER_EMAIL,
  },
  cancelled: { column: "cancelled_email_sent_at", statuses: ["cancelled"], template: "order_cancelled" },
  refunded: { column: "refunded_email_sent_at", statuses: ["refunded"], template: "order_refunded" },
};

const ORDER_COLUMNS = `
  id, order_number, full_name, email, phone, shipping_address, billing_address,
  subtotal, shipping_cost, total, status, tracking_number, created_at, delivered_at,
  order_items ( product_name, manufacturer, model, year, quantity, unit_price, line_total )
`;

/**
 * @returns {Promise<{sent: boolean, skipped?: string, error?: string, id?: string}>}
 *   Never throws — email problems must not break checkout or status changes.
 */
export async function sendOrderEmail(orderId, kind) {
  const config = KINDS[kind];
  if (!config) return { sent: false, error: `Unknown email kind "${kind}".` };

  const admin = createAdminClient();
  const claimedAt = new Date().toISOString();

  const { data: claimed, error: claimError } = await admin
    .from("orders")
    .update({ [config.column]: claimedAt })
    .eq("id", orderId)
    .is(config.column, null)
    .in("status", config.statuses)
    .select(ORDER_COLUMNS);

  if (claimError) {
    console.error(`[order email] ${kind} claim failed:`, claimError.message);
    return { sent: false, error: claimError.message };
  }
  if (!claimed?.length) return { sent: false, skipped: "already sent or not applicable" };

  const order = claimed[0];
  try {
    // Admin-edited wording/colours from /admin/templates (defaults if unreadable).
    const { templates, theme } = await getEmailSettingsOrDefaults();
    const message = renderOrderEmail(config.template, order, { template: templates[config.template], theme });
    const { data, error } = await getResend().emails.send(
      {
        from: fromAddress(),
        to: [config.to ? config.to() : order.email],
        subject: message.subject,
        html: message.html,
        text: message.text,
        tags: [
          { name: "type", value: `order_${kind}` },
          { name: "order", value: String(order.order_number) },
        ],
      },
      { idempotencyKey: `order-${order.id}-${kind}` }
    );
    if (error) throw new Error(error.message ?? String(error));
    console.info(`[order email] ${kind} sent for order ${order.order_number} (${data?.id})`);
    return { sent: true, id: data?.id };
  } catch (err) {
    // Release the claim (only if it's still ours) so the email can be retried.
    await admin.from("orders").update({ [config.column]: null }).eq("id", orderId).eq(config.column, claimedAt);
    console.error(`[order email] ${kind} failed for order ${order.order_number}:`, err.message);
    return { sent: false, error: err.message };
  }
}
