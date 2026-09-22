import Stripe from "stripe";

let client = null;

/**
 * Server-only Stripe client. The secret key has no NEXT_PUBLIC_ prefix, so
 * Next never ships it to the browser; this also refuses to run client-side.
 * Throws a clear error when the key isn't configured.
 */
export function getStripe() {
  if (typeof window !== "undefined") {
    throw new Error("getStripe() must only be used on the server.");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Payments aren't configured yet (STRIPE_SECRET_KEY is missing).");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** £12.34 -> 1234. Stripe amounts are in the smallest currency unit. */
export function toPence(amount) {
  return Math.round(Number(amount) * 100);
}
