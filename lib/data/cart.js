/**
 * Cart and wishlist reads. Both are keyed by the guest cart id from the
 * httpOnly cookie, so these only ever run on the server.
 *
 * Prices are read live from the product (discount_price when set, else
 * price) rather than stored on the line.
 */

const LINE_COLUMNS = `
  id,
  quantity,
  created_at,
  product:product_id (
    id, product, sku, price, discount_price, quantity, images, supplier, status
  )
`;

const WISHLIST_COLUMNS = `
  id,
  created_at,
  product:product_id (
    id, product, sku, price, discount_price, quantity, images, supplier, status
  )
`;

/** Price a customer actually pays for one unit. */
export function unitPrice(product) {
  const discounted = product?.discount_price;
  return Number(
    discounted === null || discounted === undefined ? product?.price ?? 0 : discounted
  );
}

/** Shapes a row for the cart/wishlist panels. */
function toLine(row) {
  const product = row.product;
  return {
    id: row.id,
    productId: product.id,
    name: product.product,
    sku: product.sku,
    image: product.images?.[0] ?? null,
    unitPrice: unitPrice(product),
    listPrice: Number(product.price ?? 0),
    hasDiscount:
      product.discount_price !== null && product.discount_price !== undefined,
    stock: product.quantity ?? 0,
    quantity: row.quantity ?? 1,
  };
}

export async function getCartItems(supabase, guestCartId) {
  if (!guestCartId) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(LINE_COLUMNS)
    .eq("guest_cart_id", guestCartId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.filter((row) => row.product).map(toLine);
}

export async function getWishlistItems(supabase, guestCartId) {
  if (!guestCartId) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(WISHLIST_COLUMNS)
    .eq("guest_cart_id", guestCartId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.filter((row) => row.product).map(toLine);
}

export function cartSubtotal(lines) {
  return lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
}
