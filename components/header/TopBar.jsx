import { Clock, Phone, Truck } from "lucide-react";

export default function TopBar() {
  return (
    <div className="hidden border-b bg-white text-xs text-neutral-600 md:block">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-2.5">
        <p>Free Shipping for all order over $100</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Monday To Sunday 9:00am to 9:00pm
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="size-3.5" />
            00 123 456 789
          </span>
          <span className="flex items-center gap-1.5">
            <Truck className="size-3.5" />
            Free Doorstep Pick-up &amp; Drop
          </span>
        </div>
      </div>
    </div>
  );
}
