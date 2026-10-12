import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import {
  FREE_DELIVERY_THRESHOLD,
  freeDeliveryProgress,
  qualifiesForFreeDelivery,
  remainingForFreeDelivery,
} from "@/lib/shipping-rules";

/**
 * How close the basket is to free delivery, with the truck travelling along
 * the bar as the subtotal grows.
 *
 * Every figure comes from the basket itself and the single threshold in
 * lib/shipping-rules.js — the same rule the checkout applies when it prices
 * delivery, so this can never promise a discount the customer doesn't get.
 */
export default function FreeDeliveryProgress({ subtotal }) {
  const qualifies = qualifiesForFreeDelivery(subtotal);
  const progress = freeDeliveryProgress(subtotal);
  const remaining = remainingForFreeDelivery(subtotal);

  return (
    <div className="space-y-2">
      <p className="text-xs text-neutral-600">
        {qualifies ? (
          <span className="font-medium text-emerald-700">
            Your order qualifies for free delivery.
          </span>
        ) : (
          <>
            Spend <span className="font-medium text-neutral-900">{formatPrice(remaining)}</span>{" "}
            more for free delivery over {formatPrice(FREE_DELIVERY_THRESHOLD)}.
          </>
        )}
      </p>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_DELIVERY_THRESHOLD}
        aria-valuenow={Math.min(Number(subtotal ?? 0), FREE_DELIVERY_THRESHOLD)}
        aria-label="Progress towards free delivery"
        className="relative h-1.5 rounded-full bg-neutral-200"
      >
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            qualifies ? "bg-emerald-600" : "bg-brand"
          }`}
          style={{ width: `${progress * 100}%` }}
        />

        {/* The truck rides the end of the bar as the basket grows. */}
        <span
          aria-hidden="true"
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
          style={{ left: `${progress * 100}%` }}
        >
          <Truck
            className={`size-4 ${qualifies ? "text-emerald-600" : "text-brand"}`}
          />
        </span>
      </div>

      <div className="flex justify-between text-[11px] text-neutral-400">
        <span>{formatPrice(subtotal ?? 0)}</span>
        <span>{formatPrice(FREE_DELIVERY_THRESHOLD)}</span>
      </div>
    </div>
  );
}
