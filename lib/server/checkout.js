import { ACTIVE_STATUS } from "@/lib/data/products";
import { unitPrice } from "@/lib/data/cart";

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
      "quantity, product:product_id ( id, product, sku, images, price, discount_price, quantity, status, manufacturer, model, year )"
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
 * Shipping charge for an order. FedEx rates aren't integrated yet, so this
 * returns £0 for now; it's the single place live FedEx quotes will plug in
 * (it already receives the destination address and priced items).
 *
 * @returns {Promise<{cost: number, service: string|null}>}
 */
export async function quoteShipping({ address, items }) {
  return { cost: 0, service: null };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
