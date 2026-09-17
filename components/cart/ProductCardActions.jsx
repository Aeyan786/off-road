"use client";

import { useRouter } from "next/navigation";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/cart/StoreProvider";
import { cn } from "@/lib/utils";

/**
 * The hover icons on a product card. Same underlying actions as the
 * product details page: view, add to cart, toggle wishlist.
 */
export default function ProductCardActions({ productId, inStock = true }) {
  const router = useRouter();
  const { addItemToCart, toggleWishlistItem, wishlistProductIds, isPending } = useStore();
  const saved = wishlistProductIds.has(productId);

  const actions = [
    {
      key: "view",
      label: "View product",
      Icon: Eye,
      onClick: () => router.push(`/products/${productId}`),
    },
    {
      key: "cart",
      label: inStock ? "Add to cart" : "Out of stock",
      Icon: ShoppingBag,
      disabled: !inStock,
      onClick: () => addItemToCart(productId),
    },
    {
      key: "wishlist",
      label: saved ? "Remove from wishlist" : "Add to wishlist",
      Icon: Heart,
      active: saved,
      onClick: () => toggleWishlistItem(productId),
    },
  ];

  return (
    <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      {actions.map(({ key, label, Icon, onClick, active, disabled }) => (
        <button
          key={key}
          type="button"
          onClick={onClick}
          disabled={isPending || disabled}
          aria-label={label}
          aria-pressed={key === "wishlist" ? saved : undefined}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/80 text-white transition-colors hover:bg-brand disabled:opacity-60",
            active && "bg-brand"
          )}
        >
          <Icon className={cn("size-3.5", active && "fill-current")} />
        </button>
      ))}
    </div>
  );
}
