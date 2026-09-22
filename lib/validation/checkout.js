import { z } from "zod";
import { shippingCountry } from "@/lib/shipping-countries";

/**
 * Server-side checkout validation (the form runs the same rules in the
 * browser for instant feedback, but this is the one that counts).
 * Addresses are stored as { line1, city, county, postcode, country } with
 * `country` an ISO code from lib/shipping-countries.js.
 */

const text = (label, max = 120) =>
  z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

// Digits with optional +, spaces, dashes, dots and brackets; 7–15 digits.
const phone = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .max(25, "Phone number is too long.")
  .refine((value) => /^\+?[\d\s().-]+$/.test(value), "Enter a valid phone number.")
  .refine((value) => {
    const digits = value.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }, "Enter a valid phone number.");

function addressSchema() {
  return z
    .object({
      line1: text("Address line", 200),
      city: text("City", 100),
      county: z.string().trim().max(100, "Too long."),
      postcode: text("Postcode", 12),
      country: z.string().trim().toUpperCase(),
    })
    .superRefine((address, ctx) => {
      const country = shippingCountry(address.country);
      if (!country) {
        ctx.addIssue({ code: "custom", path: ["country"], message: "We don't ship to that country." });
        return;
      }
      if (!country.postcode.test(address.postcode)) {
        ctx.addIssue({ code: "custom", path: ["postcode"], message: `Enter a valid ${country.name} postcode.` });
      }
      if (country.regionRequired && !address.county) {
        ctx.addIssue({ code: "custom", path: ["county"], message: `${country.regionLabel} is required.` });
      }
    })
    .transform((address) => ({
      ...address,
      postcode: address.postcode.toUpperCase().replace(/\s+/g, " "),
      county: address.county || null,
    }));
}

/** Flattens "shipping.postcode" style paths to the form's field names. */
const fieldName = (path) => path.join("_");

/**
 * @returns {{data: {full_name, email, phone, shipping, billing, billingSameAsShipping}}
 *   |{fieldErrors: Record<string, string>}}
 */
export function parseCheckoutForm(formData) {
  const get = (name) => String(formData.get(name) ?? "");
  const billingSameAsShipping = formData.get("billing_same") === "on";

  const address = (prefix) => ({
    line1: get(`${prefix}_line1`),
    city: get(`${prefix}_city`),
    county: get(`${prefix}_county`),
    postcode: get(`${prefix}_postcode`),
    country: get(`${prefix}_country`),
  });

  const schema = z.object({
    full_name: text("Full name", 120),
    email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
    phone,
    shipping: addressSchema(),
    billing: billingSameAsShipping ? z.any() : addressSchema(),
  });

  const result = schema.safeParse({
    full_name: get("full_name"),
    email: get("email"),
    phone: get("phone"),
    shipping: address("shipping"),
    billing: billingSameAsShipping ? null : address("billing"),
  });

  if (!result.success) {
    const fieldErrors = {};
    for (const issue of result.error.issues) {
      const key = fieldName(issue.path);
      fieldErrors[key] ??= issue.message;
    }
    return { fieldErrors };
  }

  const data = result.data;
  return {
    data: {
      ...data,
      billing: billingSameAsShipping ? data.shipping : data.billing,
      billingSameAsShipping,
    },
  };
}
