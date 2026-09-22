import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Stripe webhook — the only thing that turns a checkout into an order.
 * A customer landing on the success page proves nothing; this endpoint only
 * acts on events whose signature verifies against STRIPE_WEBHOOK_SECRET.
 *
 *   checkout.session.completed (paid)       -> create the order
 *   checkout.session.async_payment_succeeded -> create the order (delayed methods)
 *   checkout.session.expired / async_payment_failed -> mark the checkout expired
 *
 * Order creation (complete_checkout in 0009_orders_checkout.sql) is
 * idempotent, so Stripe's retries can't create duplicates. Any failure
 * returns 500 so Stripe retries later.
 */
export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  // The signature covers the exact raw body, so read it as text, unparsed.
  const payload = await request.text();

  let event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature ?? "", secret);
  } catch (err) {
    console.warn("[stripe webhook] rejected:", err.message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const session = event.data.object;
  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        // A completed session can still be unpaid for delayed payment
        // methods; those arrive later as async_payment_succeeded.
        if (session.payment_status !== "paid") break;

        const { data, error } = await admin.rpc("complete_checkout", {
          p_session_id: session.id,
          p_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          p_amount_total_pence: session.amount_total,
        });
        if (error) throw new Error(error.message);
        console.info(
          `[stripe webhook] ${event.type}: order ${data.order_number} ${data.created ? "created" : "already existed"}`
        );
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const { error } = await admin
          .from("checkouts")
          .update({ status: "expired" })
          .eq("stripe_checkout_session_id", session.id)
          .eq("status", "open");
        if (error) throw new Error(error.message);
        break;
      }

      default:
        // Other events aren't needed; acknowledge so Stripe stops sending them.
        break;
    }
  } catch (err) {
    console.error(`[stripe webhook] ${event.type} failed:`, err.message);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
