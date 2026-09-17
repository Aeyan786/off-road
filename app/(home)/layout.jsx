import { cookies } from "next/headers";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import StoreProvider from "@/components/cart/StoreProvider";
import { createClient } from "@/lib/supabase/server";
import { getCartItems, getWishlistItems } from "@/lib/data/cart";
import { safeQuery } from "@/lib/data/safe";
import { GUEST_CART_COOKIE } from "@/lib/guest-cart";

export default async function HomeLayout({ children }) {
  // proxy.js guarantees this cookie exists by the time anything renders.
  const cookieStore = await cookies();
  const guestCartId = cookieStore.get(GUEST_CART_COOKIE)?.value ?? null;

  const supabase = await createClient();
  const [cart, wishlist] = await Promise.all([
    safeQuery(getCartItems(supabase, guestCartId), []),
    safeQuery(getWishlistItems(supabase, guestCartId), []),
  ]);

  return (
    <StoreProvider initialCart={cart} initialWishlist={wishlist}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </StoreProvider>
  );
}
