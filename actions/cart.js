"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GUEST_CART_COOKIE, GUEST_CART_COOKIE_OPTIONS } from "@/lib/guest-cart";
import { getCartItems, getWishlistItems } from "@/lib/data/cart";
import { ACTIVE_STATUS } from "@/lib/data/products";

/**
 * The guest id normally arrives from proxy.js. A Server Action *can* set
 * cookies, so if one is somehow missing (cookie cleared mid-session) we
 * issue it here rather than failing the add.
 */
async function getGuestCartId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (existing) return existing;

  const fresh = crypto.randomUUID();
  cookieStore.set(GUEST_CART_COOKIE, fresh, GUEST_CART_COOKIE_OPTIONS);
  return fresh;
}

/** Both panels always re-render from the server's copy after a change. */
async function currentState(supabase, guestCartId) {
  const [cart, wishlist] = await Promise.all([
    getCartItems(supabase, guestCartId),
    getWishlistItems(supabase, guestCartId),
  ]);
  return { cart, wishlist };
}

/**
 * Turns anything thrown inside an action into a returned `{ error }` the
 * panels can show. A Server Action that throws surfaces as a client-side
 * crash, and Supabase rejects with a plain object rather than an Error,
 * so this has to cope with both.
 */
async function guard(run) {
  try {
    return await run();
  } catch (error) {
    const message = error?.message ?? "Something went wrong. Please try again.";
    console.error("[cart action]", message);
    return { error: message };
  }
}

export async function addToCart(productId, quantity = 1) {
  return guard(async () => {
    const supabase = await createClient();
    const guestCartId = await getGuestCartId();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, product, quantity, status")
      .eq("id", productId)
      .maybeSingle();

    if (productError) return { error: productError.message };
    // A draft is invisible to shoppers, so it can't be added even from a
    // stale page that was open before it was unpublished.
    if (!product || product.status !== ACTIVE_STATUS) {
      return { error: "That product is no longer available." };
    }
    if (product.quantity <= 0) {
      return { error: `${product.product} is out of stock.` };
    }

    const { data: existing, error: existingError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("guest_cart_id", guestCartId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError) return { error: existingError.message };

    const requested = (existing?.quantity ?? 0) + Math.max(1, quantity);
    const capped = Math.min(requested, product.quantity);

    const { error: writeError } = existing
      ? await supabase
          .from("cart_items")
          .update({ quantity: capped })
          .eq("id", existing.id)
      : await supabase.from("cart_items").insert({
          guest_cart_id: guestCartId,
          product_id: productId,
          quantity: capped,
        });

    if (writeError) return { error: writeError.message };

    return {
      ...(await currentState(supabase, guestCartId)),
      cappedAtStock: requested > product.quantity,
    };
  });
}

export async function setCartQuantity(productId, quantity) {
  if (quantity <= 0) return removeFromCart(productId);

  return guard(async () => {
    const supabase = await createClient();
    const guestCartId = await getGuestCartId();

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", productId)
      .maybeSingle();

    if (productError) return { error: productError.message };
    if (!product) return { error: "That product no longer exists." };

    const capped = Math.min(quantity, product.quantity);
    if (capped <= 0) return removeFromCart(productId);

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: capped })
      .eq("guest_cart_id", guestCartId)
      .eq("product_id", productId);

    if (error) return { error: error.message };

    return {
      ...(await currentState(supabase, guestCartId)),
      cappedAtStock: quantity > product.quantity,
    };
  });
}

export async function removeFromCart(productId) {
  return guard(async () => {
    const supabase = await createClient();
    const guestCartId = await getGuestCartId();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("guest_cart_id", guestCartId)
      .eq("product_id", productId);

    if (error) return { error: error.message };
    return currentState(supabase, guestCartId);
  });
}

/** Heart action: adds the product, or removes it if it's already saved. */
export async function toggleWishlist(productId) {
  return guard(async () => {
    const supabase = await createClient();
    const guestCartId = await getGuestCartId();

    const { data: existing, error: existingError } = await supabase
      .from("wishlist_items")
      .select("id")
      .eq("guest_cart_id", guestCartId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingError) return { error: existingError.message };

    if (existing) {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", existing.id);

      if (error) return { error: error.message };
      return { ...(await currentState(supabase, guestCartId)), added: false };
    }

    const { error } = await supabase
      .from("wishlist_items")
      .insert({ guest_cart_id: guestCartId, product_id: productId });

    if (error) return { error: error.message };
    return { ...(await currentState(supabase, guestCartId)), added: true };
  });
}

export async function removeFromWishlist(productId) {
  return guard(async () => {
    const supabase = await createClient();
    const guestCartId = await getGuestCartId();

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("guest_cart_id", guestCartId)
      .eq("product_id", productId);

    if (error) return { error: error.message };
    return currentState(supabase, guestCartId);
  });
}

/** Moves a saved product into the cart and off the wishlist. */
export async function moveWishlistItemToCart(productId) {
  const result = await addToCart(productId);
  if (result?.error) return result;
  return removeFromWishlist(productId);
}
