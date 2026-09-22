"use client";

import Image from "next/image";
import { Eye, ImageIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import OrderStatusActions from "@/components/admin/orders/OrderStatusActions";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/StatusBadges";
import { addressLines, sameAddress } from "@/lib/format-address";
import { formatOrderNumber } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });
export const formatDateTime = (value) => (value ? dateTime.format(new Date(value)) : "—");

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      {children}
    </section>
  );
}

function Address({ address }) {
  return (
    <address className="text-sm not-italic leading-relaxed text-neutral-800">
      {addressLines(address).map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
    </address>
  );
}

/** Everything about one order. Items are the snapshots taken at purchase. */
export default function OrderDetailsSheet({ order }) {
  const number = formatOrderNumber(order.order_number);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`View order ${number}`} className="cursor-pointer rounded-sm">
            <Eye className="size-3.5" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex flex-wrap items-center gap-2 text-xl font-bold">
            Order {number}
            <OrderStatusBadge status={order.status} />
          </SheetTitle>
          <SheetDescription>Placed {formatDateTime(order.created_at)}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="flex justify-end">
            <OrderStatusActions order={order} />
          </div>

          <Section title="Items">
            <ul className="divide-y rounded-sm border">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex gap-3 p-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-sm border bg-neutral-50">
                    {item.image ? (
                      <Image src={item.image} alt="" fill sizes="48px" className="object-contain" />
                    ) : (
                      <span className="flex h-full items-center justify-center"><ImageIcon className="size-4 text-neutral-300" /></span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium text-neutral-900">{item.product_name}</p>
                    <p className="text-xs text-neutral-500">
                      {[item.manufacturer, item.model, item.year].filter(Boolean).join(" · ")}
                      {item.sku ? ` · SKU ${item.sku}` : ""}
                      {item.product_id ? "" : " · product since deleted"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {item.quantity} × {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-neutral-600"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between text-neutral-600">
                <dt>Shipping{order.shipping_service ? ` (${order.shipping_service})` : ""}</dt>
                <dd>{Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost) : "Free"}</dd>
              </div>
              <div className="flex justify-between font-bold text-neutral-900"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
              {Number(order.amount_paid) !== Number(order.total) ? (
                <div className="flex justify-between text-amber-700"><dt>Charged by Stripe</dt><dd>{formatPrice(order.amount_paid)}</dd></div>
              ) : null}
            </dl>
          </Section>

          <Section title="Customer">
            <p className="text-sm text-neutral-900">{order.full_name}</p>
            <p className="text-sm text-neutral-600">
              <a href={`mailto:${order.email}`} className="cursor-pointer hover:text-brand hover:underline">{order.email}</a>
            </p>
            <p className="text-sm text-neutral-600">
              <a href={`tel:${order.phone}`} className="cursor-pointer hover:text-brand hover:underline">{order.phone}</a>
            </p>
          </Section>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Section title="Shipping address"><Address address={order.shipping_address} /></Section>
            <Section title="Billing address">
              {sameAddress(order.shipping_address, order.billing_address) ? (
                <p className="text-sm text-neutral-500">Same as shipping</p>
              ) : (
                <Address address={order.billing_address} />
              )}
            </Section>
          </div>

          <Section title="Payment">
            <div className="flex items-center gap-2"><PaymentStatusBadge status={order.payment_status} /><span className="text-xs text-neutral-500">{formatDateTime(order.paid_at)}</span></div>
            <p className="break-all text-xs text-neutral-500">Stripe session: {order.stripe_checkout_session_id}</p>
            {order.stripe_payment_intent_id ? (
              <p className="break-all text-xs text-neutral-500">Payment intent: {order.stripe_payment_intent_id}</p>
            ) : null}
          </Section>

          <Section title="Fulfilment">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-neutral-500">Tracking</dt>
              <dd className="font-medium text-neutral-900">{order.tracking_number ?? "—"}</dd>
              <dt className="text-neutral-500">Shipped</dt>
              <dd>{formatDateTime(order.shipped_at)}</dd>
              <dt className="text-neutral-500">Delivered</dt>
              <dd>{formatDateTime(order.delivered_at)}</dd>
              {order.cancelled_at ? (
                <>
                  <dt className="text-neutral-500">Cancelled</dt>
                  <dd>{formatDateTime(order.cancelled_at)}</dd>
                </>
              ) : null}
            </dl>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
