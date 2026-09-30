import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GUEST_CART_COOKIE } from "@/lib/guest-cart";
import { CHECKOUT_COOKIE } from "@/lib/checkout-session";
import { priceCart, getShippingOptions } from "@/lib/server/checkout";
import ShippingStep from "@/components/checkout/ShippingStep";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shipping",
};

/**
 * Step 2 of checkout. The checkout being paid for is identified by an
 * httpOnly cookie, and must still be open and belong to this visitor's
 * cart — the address on it is personal data, so it is never addressable by
 * a shareable URL.
 */
export default async function ShippingPage({ searchParams }) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const checkoutId = cookieStore.get(CHECKOUT_COOKIE)?.value;
  const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value;
  if (!checkoutId) redirect("/checkout");

  const { data: checkout } = await createAdminClient()
    .from("checkouts")
    .select("id, full_name, email, phone, shipping_address, billing_address, status, guest_cart_id")
    .eq("id", checkoutId)
    .maybeSingle();

  if (!checkout || checkout.status !== "open" || checkout.guest_cart_id !== guestCartId) {
    redirect("/checkout");
  }

  // Re-priced here rather than trusting what was saved a moment ago.
  const priced = await priceCart(await createClient(), guestCartId);
  if (priced.error) redirect("/checkout");

  const { options, error: optionsError } = await getShippingOptions({
    address: { ...checkout.shipping_address, name: checkout.full_name },
    items: priced.items,
  });

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="cursor-pointer hover:text-brand">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/checkout" className="cursor-pointer hover:text-brand">
          Checkout
        </Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-700">Shipping</span>
      </nav>

      <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Shipping</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Check your details and choose how you&apos;d like your order delivered.
      </p>

      {params?.cancelled === "1" ? (
        <p role="status" className="mt-4 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Payment was cancelled — you haven&apos;t been charged. Choose a shipping method to try
          again.
        </p>
      ) : null}

      <ShippingStep
        checkout={{
          full_name: checkout.full_name,
          email: checkout.email,
          phone: checkout.phone,
          shipping_address: checkout.shipping_address,
          billing_address: checkout.billing_address,
        }}
        items={priced.items}
        subtotal={priced.subtotal}
        options={options}
        optionsError={optionsError}
      />
    </div>
  );
}
