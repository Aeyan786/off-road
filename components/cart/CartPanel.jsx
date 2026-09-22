"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ButtonLink from "@/components/ui/button-link";
import { useStore } from "@/components/cart/StoreProvider";
import { formatPrice } from "@/lib/format";

/** Slide-over cart, opened whenever a product is added. */
export default function CartPanel({ open, onOpenChange }) {
  const { cart, changeCartQuantity, removeCartItem, isPending } = useStore();

  const subtotal = cart.reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-xl font-bold">Shopping cart</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <ShoppingBag className="size-8 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-700">Your cart is empty</p>
            <p className="text-xs text-neutral-500">
              Browse the catalog and add something you like.
            </p>
          </div>
        ) : (
          <ul className="flex-1 divide-y overflow-y-auto px-6">
            {cart.map((line) => (
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
                      onClick={() => removeCartItem(line.productId)}
                      disabled={isPending}
                      aria-label={`Remove ${line.name}`}
                      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border text-neutral-500 hover:text-neutral-900"
                    >
                      <X className="size-3" />
                    </button>
                  </div>

                  <p className="text-sm text-neutral-700">
                    {formatPrice(line.unitPrice)}
                    {line.hasDiscount ? (
                      <span className="ml-2 text-xs text-neutral-400 line-through">
                        {formatPrice(line.listPrice)}
                      </span>
                    ) : null}
                  </p>

                  <div className="inline-flex items-center border">
                    <button
                      type="button"
                      onClick={() => changeCartQuantity(line.productId, line.quantity - 1)}
                      disabled={isPending}
                      aria-label="Decrease quantity"
                      className="flex size-8 cursor-pointer items-center justify-center text-neutral-600 hover:bg-neutral-100"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeCartQuantity(line.productId, line.quantity + 1)}
                      disabled={isPending || line.quantity >= line.stock}
                      aria-label="Increase quantity"
                      className="flex size-8 cursor-pointer items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {cart.length > 0 ? (
          <SheetFooter className="gap-3 border-t px-6 py-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-neutral-900">Subtotal</span>
              <span className="text-lg font-bold text-neutral-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Taxes and shipping calculated at checkout
            </p>
            <ButtonLink
              href="/checkout"
              onClick={() => onOpenChange(false)}
              className="w-full cursor-pointer"
            >
              Check Out
            </ButtonLink>
      
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
