import { Truck } from "lucide-react";

/**
 * Announcement line. The free-delivery threshold is the single source in
 * lib/shipping-rules.js, shared with the cart, the checkout and the
 * shipping quote, so this line can never drift from what is charged.
 */
import { FREE_DELIVERY_LABEL } from "@/lib/shipping-rules";

export default function TopBar() {
  return (
    <div className="hidden border-b bg-white text-xs text-neutral-600 md:block">
      <div className="mx-auto flex max-w-[1400px] items-center justify-end gap-6 px-6 py-2.5">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <Truck className="size-3.5" />
          {FREE_DELIVERY_LABEL}
        </span>
      </div>
    </div>
  );
}
