"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Lock, Pencil, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderSummary from "@/components/checkout/OrderSummary";
import { continueToPayment } from "@/actions/checkout";
import { addressLines } from "@/lib/format-address";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Read-only recap of what the customer entered on the details step. */
function AddressCard({ title, address, name, contact }) {
  return (
    <div className="rounded-sm border bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      <address className="mt-2 text-sm not-italic leading-relaxed text-neutral-800">
        {name ? <span className="block font-medium">{name}</span> : null}
        {addressLines(address).map((line) => (
          <span key={line} className="block text-neutral-600">
            {line}
          </span>
        ))}
        {contact ? <span className="mt-1 block text-xs text-neutral-500">{contact}</span> : null}
      </address>
    </div>
  );
}

/**
 * Step 2 of checkout: review the address, pick a UPS service, continue to
 * Stripe. The prices shown come from UPS via the server; the server quotes
 * UPS again before creating the payment, so nothing here is trusted.
 */
export default function ShippingStep({ checkout, items, subtotal, options, optionsError }) {
  const [selected, setSelected] = useState(options[0]?.code ?? null);
  const [error, setError] = useState(null);
  const [problems, setProblems] = useState([]);
  const [isPending, startTransition] = useTransition();

  const chosen = options.find((option) => option.code === selected) ?? null;

  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setProblems([]);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await continueToPayment(null, formData);
      // On success the action redirects to Stripe and nothing returns.
      if (result?.error) setError(result.error);
      if (result?.problems) setProblems(result.problems);
    });
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
      <form onSubmit={handleSubmit} noValidate className="order-2 space-y-8 lg:order-1">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-neutral-900">Shipping details</h2>
            <Link
              href="/checkout"
              className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              <Pencil className="size-3.5" />
              Edit details
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AddressCard
              title="Ship to"
              address={checkout.shipping_address}
              name={checkout.full_name}
              contact={`${checkout.email} · ${checkout.phone}`}
            />
            <AddressCard title="Bill to" address={checkout.billing_address} name={checkout.full_name} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">Shipping method</h2>

          {optionsError ? (
            <p role="alert" className="rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {optionsError}
            </p>
          ) : (
            <ul className="space-y-2">
              {options.map((option) => (
                <li key={option.code}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-sm border px-4 py-3.5 transition-colors",
                      selected === option.code
                        ? "border-brand bg-brand/5 ring-1 ring-brand"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <input
                        type="radio"
                        name="service_code"
                        value={option.code}
                        checked={selected === option.code}
                        onChange={() => setSelected(option.code)}
                        className="size-4 cursor-pointer accent-brand"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-neutral-900">
                          {option.name}
                        </span>
                        <span className="block text-xs text-neutral-500">Delivered by UPS</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-neutral-900">
                      {formatPrice(option.cost)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Truck className="size-3.5" />
            Prices are quoted by UPS for your delivery address.
          </p>
        </section>

        {error ? (
          <div role="alert" className="space-y-1 rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">{error}</p>
            {problems.length > 0 ? (
              <ul className="list-disc pl-5">
                {problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={isPending || !chosen}
          className="w-full cursor-pointer rounded-sm px-6 sm:w-auto"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {isPending ? "Redirecting to payment…" : "Continue to Payment"}
        </Button>
      </form>

      <div className="order-1 lg:order-2">
        <OrderSummary
          items={items}
          subtotal={subtotal}
          shipping={chosen ? chosen.cost : null}
          shippingNote="Choose a shipping method"
        />
      </div>
    </div>
  );
}
