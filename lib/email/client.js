import { Resend } from "resend";

let client = null;

// Resend's shared test sender works without a verified domain, but only
// delivers to the Resend account owner's own inbox. Set RESEND_FROM_EMAIL
// (e.g. "Off Road Performance <orders@yourdomain.com>") once a domain is
// verified in Resend.
const FALLBACK_FROM = "Off Road Performance <onboarding@resend.dev>";

/** Server-only Resend client; the key never reaches the browser. */
export function getResend() {
  if (typeof window !== "undefined") {
    throw new Error("getResend() must only be used on the server.");
  }
  const key = process.env.RESEND_SECRET ?? process.env.RESEND_API_KEY;
  if (!key) throw new Error("Email isn't configured (RESEND_SECRET is missing).");
  client ??= new Resend(key);
  return client;
}

export function fromAddress() {
  return process.env.RESEND_FROM_EMAIL || FALLBACK_FROM;
}
