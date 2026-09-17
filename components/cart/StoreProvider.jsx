"use client";

import { createContext, useContext, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addToCart,
  moveWishlistItemToCart,
  removeFromCart,
  removeFromWishlist,
  setCartQuantity,
  toggleWishlist,
} from "@/actions/cart";
import CartPanel from "@/components/cart/CartPanel";
import WishlistPanel from "@/components/cart/WishlistPanel";

const StoreContext = createContext(null);

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside <StoreProvider>");
  return value;
}

/**
 * Holds the cart and wishlist for the storefront and owns both slide-over
 * panels.
 *
 * The server is the source of truth: every action returns the full, fresh
 * cart and wishlist (read back from the database), which replaces local
 * state. That keeps the panels correct without a page navigation.
 */
export default function StoreProvider({ initialCart = [], initialWishlist = [], children }) {
  const [cart, setCart] = useState(initialCart);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  /** Runs a server action and folds its result back into state. */
  function run(action, { onSuccess } = {}) {
    startTransition(async () => {
      const result = await action();

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.cart) setCart(result.cart);
      if (result?.wishlist) setWishlist(result.wishlist);
      onSuccess?.(result);
    });
  }

  const value = useMemo(() => {
    const wishlistProductIds = new Set(wishlist.map((line) => line.productId));

    return {
      cart,
      wishlist,
      isPending,
      wishlistProductIds,
      cartCount: cart.reduce((total, line) => total + line.quantity, 0),
      wishlistCount: wishlist.length,

      openCart: () => setCartOpen(true),
      openWishlist: () => setWishlistOpen(true),

      addItemToCart: (productId, quantity = 1) =>
        run(() => addToCart(productId, quantity), {
          onSuccess: (result) => {
            setCartOpen(true);
            if (result.cappedAtStock) {
              toast.info("Quantity limited to the stock available.");
            }
          },
        }),

      changeCartQuantity: (productId, quantity) =>
        run(() => setCartQuantity(productId, quantity), {
          onSuccess: (result) => {
            if (result.cappedAtStock) {
              toast.info("Quantity limited to the stock available.");
            }
          },
        }),

      removeCartItem: (productId) => run(() => removeFromCart(productId)),

      toggleWishlistItem: (productId, { openPanel = true } = {}) =>
        run(() => toggleWishlist(productId), {
          onSuccess: (result) => {
            if (result.added && openPanel) setWishlistOpen(true);
            else if (!result.added) toast.success("Removed from wishlist.");
          },
        }),

      removeWishlistItem: (productId) => run(() => removeFromWishlist(productId)),

      moveToCart: (productId) =>
        run(() => moveWishlistItemToCart(productId), {
          onSuccess: () => {
            setWishlistOpen(false);
            setCartOpen(true);
          },
        }),
    };
  }, [cart, wishlist, isPending]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <CartPanel open={cartOpen} onOpenChange={setCartOpen} />
      <WishlistPanel open={wishlistOpen} onOpenChange={setWishlistOpen} />
    </StoreContext.Provider>
  );
}
