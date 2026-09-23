"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GUEST_CART_COOKIE } from "@/lib/guest-cart";
import { parseCheckoutForm } from "@/lib/validation/checkout";
import { priceCart, quoteShipping } from "@/lib/server/checkout";
import { getStripe, toPence } from "@/lib/stripe";
import { shippingCountry } from "@/lib/shipping-countries";
import { siteUrl } from "@/lib/site";

const addressLine = (a) =>
  [a.line1, a.city, a.county, a.postcode, shippingCountry(a.country)?.name ?? a.country]
    .filter(Boolean)
    .join(", ");

/**
 * "Proceed to Pay". Validates the form, prices the cart from the database
 * (nothing price- or product-related is taken from the browser), saves the
 * checkout, then sends the customer to Stripe Checkout.
 *
 * No order exists at this point: only the Stripe webhook creates orders,
 * after Stripe confirms the payment. The cart is left untouched.
 */
export async function startCheckout(_prev, formData) {
  const parsed = parseCheckoutForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
  const customer = parsed.data;

  const guestCartId = (await cookies()).get(GUEST_CART_COOKIE)?.value;
  let sessionUrl;

  try {
    const priced = await priceCart(await createClient(), guestCartId);
    if (priced.error) return { error: priced.error, problems: priced.problems ?? [] };

    const shipping = await quoteShipping({ address: customer.shipping, items: priced.items });
    const total = Math.round((priced.subtotal + shipping.cost) * 100) / 100;

    // Fail before saving anything if payments aren't configured.
    const stripe = getStripe();
    const admin = createAdminClient();
    const { data: checkout, error: insertError } = await admin
      .from("checkouts")
      .insert({
        guest_cart_id: guestCartId,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        shipping_address: customer.shipping,
        billing_address: customer.billing,
        items: priced.items,
        subtotal: priced.subtotal,
        shipping_cost: shipping.cost,
        shipping_service: shipping.service,
        total,
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    const origin = siteUrl();
    const { shipping: ship } = customer;
    const metadata = {
      checkout_id: checkout.id,
      customer_name: customer.full_name,
      customer_phone: customer.phone,
      shipping_address: addressLine(ship).slice(0, 500),
      billing_address: addressLine(customer.billing).slice(0, 500),
    };

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        currency: "gbp",
        customer_email: customer.email,
        client_reference_id: checkout.id,
        line_items: priced.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "gbp",
            unit_amount: toPence(item.unit_price),
            product_data: {
              name:
                [item.manufacturer, item.model, item.year, item.product_name]
                  .filter(Boolean)
                  .join(" ")
                  .slice(0, 250) || item.product_name,
              metadata: { product_id: item.product_id, ...(item.sku ? { sku: item.sku } : {}) },
              ...(item.image?.startsWith("https://") ? { images: [item.image] } : {}),
            },
          },
        })),
        ...(shipping.cost > 0
          ? {
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    display_name: shipping.service ?? "Shipping",
                    fixed_amount: { amount: toPence(shipping.cost), currency: "gbp" },
                  },
                },
              ],
            }
          : {}),
        payment_intent_data: {
          metadata,
          shipping: {
            name: customer.full_name,
            phone: customer.phone,
            address: {
              line1: ship.line1,
              city: ship.city,
              state: ship.county ?? undefined,
              postal_code: ship.postcode,
              country: ship.country,
            },
          },
        },
        metadata,
        // Short enough that prices/stock don't go stale (Stripe's minimum).
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?cancelled=1`,
      },
      // Retrying this same checkout can never open a second Stripe session.
      { idempotencyKey: `checkout-${checkout.id}` }
    );

    const { error: updateError } = await admin
      .from("checkouts")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", checkout.id);
    if (updateError) throw new Error(updateError.message);

    sessionUrl = session.url;
  } catch (err) {
    console.error("[checkout]", err.message);
    // Details (including a missing Stripe key) go to the server log only.
    return {
      error: err.message?.startsWith("Payments aren't configured")
        ? "Online payment is temporarily unavailable. Please try again later."
        : "We couldn't start the payment. Please try again.",
    };
  }

  // Outside the try: redirect() works by throwing.
  redirect(sessionUrl);
}
