import Link from "next/link";
import { cookies } from "next/headers";
import { ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GUEST_CART_COOKIE } from "@/lib/guest-cart";
import { priceCart, quoteShipping } from "@/lib/server/checkout";
import { safeQuery } from "@/lib/data/safe";
import ButtonLink from "@/components/ui/button-link";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { SHIPPING_COUNTRIES } from "@/lib/shipping-countries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | Off Road Performance",
};

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const guestCartId = (await cookies()).get(GUEST_CART_COOKIE)?.value;
  const priced = await safeQuery(priceCart(await createClient(), guestCartId), {
    error: "We couldn't load your cart. Please refresh the page.",
  });

  const empty = priced.error === "Your cart is empty.";
  const shipping = priced.items ? await quoteShipping({ address: null, items: priced.items }) : null;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="cursor-pointer hover:text-brand">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Checkout</h1>

      {params?.cancelled === "1" && !empty ? (
        <p role="status" className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment was cancelled — you haven&apos;t been charged. Your cart is still here
          whenever you&apos;re ready.
        </p>
      ) : null}

      {empty ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-neutral-300 py-20 text-center">
          <ShoppingBag className="size-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-700">Your cart is empty</p>
          <ButtonLink href="/products" className="cursor-pointer">Browse products</ButtonLink>
        </div>
      ) : priced.error && !priced.problems ? (
        <p role="alert" className="mt-8 rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {priced.error}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          <div className="order-2 lg:order-1">
            {priced.problems ? (
              <div role="alert" className="mb-6 space-y-1 rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <p className="font-semibold">{priced.error}</p>
                <ul className="list-disc pl-5">
                  {priced.problems.map((problem) => (
                    <li key={problem}>{problem}</li>
                  ))}
                </ul>
                <p className="text-xs">Open your cart to fix these, then refresh this page.</p>
              </div>
            ) : null}
            <CheckoutForm
              countries={SHIPPING_COUNTRIES.map(({ code, name, regionLabel, regionRequired }) => ({
                code,
                name,
                regionLabel,
                regionRequired,
              }))}
              disabled={Boolean(priced.problems)}
            />
          </div>
          <div className="order-1 lg:order-2">
            {priced.items ? (
              <OrderSummary items={priced.items} subtotal={priced.subtotal} shipping={shipping.cost} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
