import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import ButtonLink from "@/components/ui/button-link";
import AutoRefresh from "@/components/checkout/AutoRefresh";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order confirmation | Off Road Performance",
};

/**
 * Where Stripe sends the customer after paying. This page never marks
 * anything as paid: it only reports what the webhook has stored. If the
 * webhook hasn't landed yet (it usually takes a second or two) it shows a
 * "confirming" state and refreshes itself.
 */
async function lookup(sessionId) {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return { state: "unknown" };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("order_number, status")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (order) return { state: "paid", order };

  const { data: checkout } = await admin
    .from("checkouts")
    .select("status")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (!checkout) return { state: "unknown" };
  return { state: checkout.status === "expired" ? "failed" : "confirming" };
}

export default async function CheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const { state, order } = await lookup(params?.session_id);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      {state === "paid" ? (
        <>
          <CheckCircle2 className="size-14 text-emerald-500" />
          <h1 className="mt-5 text-3xl font-bold text-neutral-900">Your order has been completed.</h1>
          <p className="mt-3 text-neutral-600">Check your email to continue tracking your order.</p>
          <p className="mt-6 rounded-sm border bg-neutral-50 px-5 py-3 text-sm text-neutral-700">
            Order reference{" "}
            <span className="font-bold text-neutral-900">#{order.order_number}</span>
          </p>
          <ButtonLink href="/products" className="mt-8 cursor-pointer">Continue shopping</ButtonLink>
        </>
      ) : state === "confirming" ? (
        <>
          <Clock className="size-14 animate-pulse text-brand" />
          <h1 className="mt-5 text-2xl font-bold text-neutral-900">Confirming your payment…</h1>
          <p className="mt-3 text-neutral-600">
            This usually takes a few seconds. Please keep this page open.
          </p>
          <AutoRefresh intervalMs={2000} maxAttempts={30}>
            <p className="mt-6 text-sm text-neutral-500">
              Still waiting? Your payment may take a little longer to confirm. We&apos;ll email
              you as soon as it does —{" "}
              <Link href="/contact" className="cursor-pointer text-brand hover:underline">contact us</Link>{" "}
              if you don&apos;t hear from us.
            </p>
          </AutoRefresh>
        </>
      ) : state === "failed" ? (
        <>
          <XCircle className="size-14 text-destructive" />
          <h1 className="mt-5 text-2xl font-bold text-neutral-900">Payment wasn&apos;t completed</h1>
          <p className="mt-3 text-neutral-600">You haven&apos;t been charged. Your cart is still saved.</p>
          <ButtonLink href="/checkout" className="mt-8 cursor-pointer">Return to checkout</ButtonLink>
        </>
      ) : (
        <>
          <XCircle className="size-14 text-neutral-300" />
          <h1 className="mt-5 text-2xl font-bold text-neutral-900">We couldn&apos;t find that order</h1>
          <p className="mt-3 text-neutral-600">
            If you&apos;ve just paid, check your email for confirmation or contact us.
          </p>
          <ButtonLink href="/" className="mt-8 cursor-pointer">Back to home</ButtonLink>
        </>
      )}
    </div>
  );
}
