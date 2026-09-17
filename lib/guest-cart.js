/**
 * Identifies a visitor who isn't signed in, so their cart and wishlist can
 * survive navigation. Created in proxy.js on the first request that doesn't
 * already carry one, and never regenerated while it is present.
 */
export const GUEST_CART_COOKIE = "guest_cart";

export const GUEST_CART_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365, // one year
};
