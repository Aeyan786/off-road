import { z } from "zod";

/**
 * Server-side product validation.
 *
 * Every field is required except `description` and
 * `additional_information`. Values arrive from FormData, so everything is a
 * string until it's coerced here — empty strings count as missing rather
 * than as 0.
 */

function requiredText(label) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`);
}

function optionalText() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null));
}

function requiredNumber(label, { integer = false } = {}) {
  let schema = z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? `${label} is required.`
          : `${label} must be a number.`,
    })
    .min(0, `${label} cannot be negative.`);

  if (integer) {
    schema = schema.int(`${label} must be a whole number.`);
  }

  return z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, schema);
}

/** Optional numeric field: blank clears it to null. */
function optionalNumber(label) {
  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    },
    z
      .number({ error: `${label} must be a number.` })
      .min(0, `${label} cannot be negative.`)
      .nullable()
  );
}

export const productSchema = z.object({
  // Plain text column with no DB constraint, so the allowed values are
  // enforced here (mirrors PRODUCT_STATUSES in lib/data/products.js).
  status: z
    .enum(["active", "draft"], { error: "Choose a valid status." })
    .default("active"),
  new_arrival: z.boolean().default(false),
  product: requiredText("Product name"),
  sku: requiredText("SKU"),
  categories: z.uuid("Select a category."),
  supplier: requiredText("Supplier"),
  manufacturer: requiredText("Manufacturer"),
  model: requiredText("Model"),
  year: requiredText("Year"),
  small_description: requiredText("Short description"),
  description: optionalText(),
  additional_information: optionalText(),
  price: requiredNumber("Price"),
  discount_price: optionalNumber("Discount price"),
  quantity: requiredNumber("Quantity", { integer: true }),
  width: requiredNumber("Width"),
  length: requiredNumber("Length"),
  height: requiredNumber("Height"),
  weight_grams: requiredNumber("Weight"),
  images: z
    .array(z.url("Each image must be a valid URL."))
    .min(1, "Add at least one image."),
});

/**
 * Parses a product <form> submission.
 * @returns {{data: object}|{fieldErrors: Record<string, string>}}
 */
export function parseProductForm(formData) {
  const rawImages = formData.get("images");
  let images = [];
  if (rawImages) {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) images = parsed;
    } catch {
      return { fieldErrors: { images: "Could not read the selected images." } };
    }
  }

  const result = productSchema.safeParse({
    status: formData.get("status") || "active",
    // An unticked checkbox submits nothing at all.
    new_arrival: formData.has("new_arrival"),
    product: formData.get("product") ?? "",
    sku: formData.get("sku") ?? "",
    categories: formData.get("categories") ?? "",
    supplier: formData.get("supplier") ?? "",
    manufacturer: formData.get("manufacturer") ?? "",
    model: formData.get("model") ?? "",
    year: formData.get("year") ?? "",
    small_description: formData.get("small_description") ?? "",
    description: formData.get("description") ?? "",
    additional_information: formData.get("additional_information") ?? "",
    price: formData.get("price"),
    discount_price: formData.get("discount_price"),
    quantity: formData.get("quantity"),
    width: formData.get("width"),
    length: formData.get("length"),
    height: formData.get("height"),
    weight_grams: formData.get("weight_grams"),
    images,
  });

  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    // One message per field is all the form UI shows.
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]])
      ),
    };
  }

  return { data: result.data };
}
