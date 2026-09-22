import Image from "next/image";
import { ImageIcon, Lock } from "lucide-react";
import { formatPrice } from "@/lib/format";

/**
 * Checkout sidebar. Everything here was priced on the server from the
 * database (lib/server/checkout.js), not from the browser's cart state.
 */
export default function OrderSummary({ items, subtotal, shipping }) {
  const total = subtotal + shipping;

  return (
    <aside className="rounded-sm border bg-neutral-50 p-5 lg:sticky lg:top-46">
      <h2 className="text-lg font-bold text-neutral-900">Order summary</h2>

      <ul className="mt-4 divide-y">
        {items.map((item) => (
          <li key={item.product_id} className="flex gap-3 py-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-sm border bg-white">
              {item.image ? (
                <Image src={item.image} alt="" fill sizes="64px" className="object-contain" />
              ) : (
                <span className="flex h-full items-center justify-center">
                  <ImageIcon className="size-4 text-neutral-300" />
                </span>
              )}
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-semibold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900">{item.product_name}</p>
              <p className="truncate text-xs text-neutral-500">
                {[item.manufacturer, item.model, item.year].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {item.quantity} × {formatPrice(item.unit_price)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-neutral-900">{formatPrice(item.line_total)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-2 space-y-2 border-t pt-4 text-sm">
        <div className="flex justify-between text-neutral-600">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-neutral-600">
          <dt>Shipping</dt>
          <dd>{shipping > 0 ? formatPrice(shipping) : "Free"}</dd>
        </div>
        <div className="flex justify-between border-t pt-3 text-base font-bold text-neutral-900">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-500">
        <Lock className="size-3.5" />
        You&apos;ll pay securely on Stripe&apos;s checkout page.
      </p>
    </aside>
  );
}
