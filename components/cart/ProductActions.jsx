"use client";

import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/cart/StoreProvider";
import { cn } from "@/lib/utils";

/**
 * Add to Cart / Add to Wishlist for the product details page. Both call the
 * same store actions the product-card hover icons use.
 */
export default function ProductActions({ productId, inStock }) {
  const { addItemToCart, toggleWishlistItem, wishlistProductIds, isPending } = useStore();
  const saved = wishlistProductIds.has(productId);

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        className="cursor-pointer rounded-sm px-6"
        disabled={!inStock || isPending}
        onClick={() => addItemToCart(productId)}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShoppingBag className="size-4" />
        )}
        {inStock ? "Add to Cart" : "Out of stock"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="cursor-pointer rounded-sm px-6"
        disabled={isPending}
        aria-pressed={saved}
        onClick={() => toggleWishlistItem(productId)}
      >
        <Heart className={cn("size-4", saved && "fill-current text-brand")} />
        {saved ? "In Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
}
