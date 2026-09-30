"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GUEST_CART_COOKIE } from "@/lib/guest-cart";
import { CHECKOUT_COOKIE, CHECKOUT_COOKIE_OPTIONS } from "@/lib/checkout-session";
import { parseCheckoutForm } from "@/lib/validation/checkout";
import { priceCart, resolveShippingOption } from "@/lib/server/checkout";
import { getStripe, toPence } from "@/lib/stripe";
import { shippingCountry } from "@/lib/shipping-countries";
import { siteUrl } from "@/lib/site";

const addressLine = (a) =>
  [a.line1, a.city, a.county, a.postcode, shippingCountry(a.country)?.name ?? a.country]
    .filter(Boolean)
    .join(", ");

/**
 * Step 1 — "Proceed to Checkout". Validates the form, prices the cart from
 * the database (nothing price- or product-related is taken from the
 * browser) and saves an open checkout, then sends the customer to the
 * shipping step. No Stripe session and no order exist yet.
 */
export async function startCheckout(_prev, formData) {
  const parsed = parseCheckoutForm(formData);
  if (parsed.fieldErrors) return { fieldErrors: parsed.fieldErrors };
  const customer = parsed.data;

  const guestCartId = (await cookies()).get(GUEST_CART_COOKIE)?.value;

  try {
    const priced = await priceCart(await createClient(), guestCartId);
    if (priced.error) return { error: priced.error, problems: priced.problems ?? [] };

    // Shipping is chosen on the next step; the total starts as the subtotal.
    const { data: checkout, error: insertError } = await createAdminClient()
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
        shipping_cost: 0,
        shipping_service: null,
        total: priced.subtotal,
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    (await cookies()).set(CHECKOUT_COOKIE, checkout.id, CHECKOUT_COOKIE_OPTIONS);
  } catch (err) {
    console.error("[checkout]", err.message);
    return { error: "We couldn't save your details. Please try again." };
  }

  redirect("/checkout/shipping");
}

/**
 * Step 2 — "Continue to Payment". Re-prices the cart and re-quotes UPS on
 * the server, so the shipping charge that reaches Stripe is UPS's price for
 * the option the customer picked, never a number sent by the browser.
 */
export async function continueToPayment(_prev, formData) {
  const code = String(formData.get("service_code") ?? "").trim();
  if (!code) return { error: "Choose a shipping method to continue." };

  const cookieStore = await cookies();
  const checkoutId = cookieStore.get(CHECKOUT_COOKIE)?.value;
  const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!checkoutId) return { error: "Your checkout has expired. Please enter your details again." };

  let sessionUrl;
  try {
    const admin = createAdminClient();
    const { data: checkout, error: loadError } = await admin
      .from("checkouts")
      .select("id, full_name, email, phone, shipping_address, billing_address, status, guest_cart_id")
      .eq("id", checkoutId)
      .maybeSingle();
    if (loadError) throw new Error(loadError.message);
    if (!checkout || checkout.status !== "open" || checkout.guest_cart_id !== guestCartId) {
      return { error: "Your checkout has expired. Please enter your details again." };
    }

    // Re-price from the database: stock and prices may have moved on.
    const priced = await priceCart(await createClient(), guestCartId);
    if (priced.error) return { error: priced.error, problems: priced.problems ?? [] };

    const { option, error: shippingError } = await resolveShippingOption({
      address: { ...checkout.shipping_address, name: checkout.full_name },
      items: priced.items,
      code,
    });
    if (shippingError) return { error: shippingError };

    const total = Math.round((priced.subtotal + option.cost) * 100) / 100;

    // Fail before saving anything if payments aren't configured.
    const stripe = getStripe();
    const { error: updateError } = await admin
      .from("checkouts")
      .update({
        items: priced.items,
        subtotal: priced.subtotal,
        shipping_cost: option.cost,
        shipping_service: option.name,
        total,
      })
      .eq("id", checkout.id)
      .eq("status", "open");
    if (updateError) throw new Error(updateError.message);

    const origin = siteUrl();
    const ship = checkout.shipping_address;
    const metadata = {
      checkout_id: checkout.id,
      customer_name: checkout.full_name,
      customer_phone: checkout.phone,
      shipping_address: addressLine(ship).slice(0, 500),
      billing_address: addressLine(checkout.billing_address).slice(0, 500),
      shipping_service: option.name.slice(0, 100),
    };

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        currency: "gbp",
        customer_email: checkout.email,
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
        ...(option.cost > 0
          ? {
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: "fixed_amount",
                    display_name: option.name,
                    fixed_amount: { amount: toPence(option.cost), currency: "gbp" },
                  },
                },
              ],
            }
          : {}),
        payment_intent_data: {
          metadata,
          shipping: {
            name: checkout.full_name,
            phone: checkout.phone,
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
        cancel_url: `${origin}/checkout/shipping?cancelled=1`,
      },
      // Retrying the same checkout and service can never open a second session.
      { idempotencyKey: `checkout-${checkout.id}-${option.code}` }
    );

    const { error: sessionError } = await admin
      .from("checkouts")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", checkout.id);
    if (sessionError) throw new Error(sessionError.message);

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
