"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/cart/StoreProvider";

/**
 * Header wishlist/cart triggers. Keeps the existing link styling — they
 * open the slide-over panels instead of navigating, and show a count once
 * there's something saved.
 */
export default function HeaderStoreActions() {
  const { openCart, openWishlist, cartCount, wishlistCount } = useStore();

  return (
    <>
      <button
        type="button"
        onClick={openWishlist}
        aria-label="Wishlist"
        className="relative flex cursor-pointer items-center gap-2 text-neutral-800 hover:text-brand"
      >
        <Heart className="size-5" /> Wishlist
        {wishlistCount > 0 ? (
          <span className="text-xs font-semibold text-brand">({wishlistCount})</span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={openCart}
        aria-label="Cart"
        className="relative flex cursor-pointer items-center gap-2 text-neutral-800 hover:text-brand"
      >
        <ShoppingBag className="size-5" /> Cart
        {cartCount > 0 ? (
          <span className="text-xs font-semibold text-brand">({cartCount})</span>
        ) : null}
      </button>
    </>
  );
}
