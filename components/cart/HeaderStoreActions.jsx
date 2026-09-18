"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/cart/StoreProvider";

/**
 * One header trigger. From `sm` up it shows the label with the count in
 * brackets; on phones it collapses to the icon with a count badge.
 */
function StoreButton({ icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className="relative flex cursor-pointer items-center gap-2 text-neutral-800 hover:text-brand"
    >
      <span className="relative">
        <Icon className="size-5" />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white sm:hidden">
            {count}
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline">{label}</span>
      {count > 0 ? (
        <span className="hidden text-xs font-semibold text-brand sm:inline">({count})</span>
      ) : null}
    </button>
  );
}

/**
 * Header wishlist/cart triggers. They open the slide-over panels instead of
 * navigating, and show a count once there's something saved.
 */
export default function HeaderStoreActions() {
  const { openCart, openWishlist, cartCount, wishlistCount } = useStore();

  return (
    <>
      <StoreButton icon={Heart} label="Wishlist" count={wishlistCount} onClick={openWishlist} />
      <StoreButton icon={ShoppingBag} label="Cart" count={cartCount} onClick={openCart} />
    </>
  );
}
