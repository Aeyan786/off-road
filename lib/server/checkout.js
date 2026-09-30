import { ACTIVE_STATUS } from "@/lib/data/products";
import { unitPrice } from "@/lib/data/cart";
import { isUpsConfigured, shopRates } from "@/lib/shipping/ups";
import { buildPackages } from "@/lib/shipping/packages";

/**
 * Builds a priced checkout from the guest's cart, entirely from the
 * database: product ids, quantities and prices are never taken from the
 * browser. Every line must still be for sale and in stock.
 *
 * @returns {Promise<{items: object[], subtotal: number}|{error: string, problems?: string[]}>}
 */
export async function priceCart(supabase, guestCartId) {
  if (!guestCartId) return { error: "Your cart is empty." };

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "quantity, product:product_id ( id, product, sku, images, price, discount_price, quantity, status, manufacturer, model, year, weight_grams )"
    )
    .eq("guest_cart_id", guestCartId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!data?.length) return { error: "Your cart is empty." };

  const problems = [];
  const items = [];

  for (const line of data) {
    const product = line.product;
    if (!product || product.status !== ACTIVE_STATUS) {
      problems.push(`${product?.product ?? "A product"} is no longer available — please remove it from your cart.`);
      continue;
    }
    if ((product.quantity ?? 0) < line.quantity) {
      problems.push(
        product.quantity > 0
          ? `Only ${product.quantity} × ${product.product} left in stock — please reduce the quantity.`
          : `${product.product} is out of stock — please remove it from your cart.`
      );
      continue;
    }

    const price = unitPrice(product);
    items.push({
      product_id: product.id,
      product_name: product.product,
      sku: product.sku,
      image: product.images?.[0] ?? null,
      manufacturer: product.manufacturer,
      model: product.model,
      year: product.year,
      // Carried through for UPS rating; order_items ignores extra keys.
      weight_grams: product.weight_grams,
      unit_price: round2(price),
      quantity: line.quantity,
      line_total: round2(price * line.quantity),
    });
  }

  if (problems.length > 0) {
    return { error: "Some items in your cart need attention.", problems };
  }

  const subtotal = round2(items.reduce((sum, item) => sum + item.line_total, 0));
  return { items, subtotal };
}

/**
 * The UPS services the customer can choose from for this destination and
 * cart, priced by UPS. Never throws: the shipping step shows the reason
 * instead of failing the whole page.
 *
 * @returns {Promise<{options: object[], error: string|null}>}
 */
export async function getShippingOptions({ address, items }) {
  if (!isUpsConfigured()) {
    return { options: [], error: "Shipping isn't available right now. Please contact us to complete your order." };
  }

  try {
    const options = await shopRates({
      destination: {
        name: address.name,
        line1: address.line1,
        city: address.city,
        region: address.county,
        postcode: address.postcode,
        country: address.country,
      },
      packages: buildPackages(items),
    });

    if (!options.length) {
      return { options: [], error: "UPS doesn't offer a service to this address for this order." };
    }

    // We charge in GBP, so a quote in any other currency can't be used as-is.
    const wrongCurrency = options.filter((option) => option.currency !== "GBP");
    const usable = options.filter((option) => option.currency === "GBP");
    if (!usable.length) {
      console.error("[shipping] UPS quoted in", wrongCurrency[0]?.currency, "but the store charges GBP");
      return { options: [], error: "We couldn't price shipping to this address. Please contact us." };
    }

    return { options: usable, error: null };
  } catch (err) {
    console.error("[shipping]", err.message);
    return { options: [], error: "We couldn't reach UPS for shipping prices. Please try again in a moment." };
  }
}

/**
 * Re-prices with UPS and returns the option the customer picked. The price
 * charged always comes from this fresh quote, never from the browser.
 *
 * @returns {Promise<{option: object|null, error: string|null}>}
 */
export async function resolveShippingOption({ address, items, code }) {
  const { options, error } = await getShippingOptions({ address, items });
  if (error) return { option: null, error };

  const option = options.find((candidate) => candidate.code === String(code));
  if (!option) {
    return { option: null, error: "That shipping option is no longer available — please choose another." };
  }
  return { option, error: null };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
