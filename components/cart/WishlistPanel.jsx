"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/cart/StoreProvider";
import { formatPrice } from "@/lib/format";

/** Slide-over wishlist, matching the cart panel's behaviour. */
export default function WishlistPanel({ open, onOpenChange }) {
  const { wishlist, removeWishlistItem, moveToCart, isPending } = useStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-xl font-bold">Wishlist</SheetTitle>
        </SheetHeader>

        {wishlist.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <Heart className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-700">
              Your wishlist is empty
            </p>
            <p className="text-xs text-neutral-500">
              Tap the heart on any product to save it for later.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto px-6">
            {wishlist.map((line) => (
              <li key={line.productId} className="flex gap-4 py-5">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-sm border bg-neutral-100">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${line.productId}`}
                      onClick={() => onOpenChange(false)}
                      className="cursor-pointer text-sm font-semibold uppercase text-neutral-900 hover:text-brand"
                    >
                      {line.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeWishlistItem(line.productId)}
                      disabled={isPending}
                      aria-label={`Remove ${line.name} from wishlist`}
                      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border text-neutral-500 hover:text-neutral-900"
                    >
                      <X className="size-3" />
                    </button>
                  </div>

                  <p className="text-sm text-neutral-700">
                    {formatPrice(line.unitPrice)}
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    className="cursor-pointer rounded-sm px-3 text-xs"
                    disabled={isPending || line.stock <= 0}
                    onClick={() => moveToCart(line.productId)}
                  >
                    <ShoppingBag className="size-3.5" />
                    {line.stock > 0 ? "Move to cart" : "Out of stock"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
