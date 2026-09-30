/**
 * Identifies the checkout the customer is part-way through, between the
 * details step (/checkout) and the shipping step (/checkout/shipping).
 *
 * The id lives in an httpOnly cookie rather than the URL: the checkout row
 * holds the customer's address and contact details, so a link to it must
 * not be shareable.
 */
export const CHECKOUT_COOKIE = "checkout_id";

export const CHECKOUT_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60, // an hour — long enough to pick a service, short enough that prices stay fresh
};
