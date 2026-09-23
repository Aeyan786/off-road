"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { ACTIVE_STATUS } from "@/lib/data/products";

const schema = z.object({
  customer_name: z.string().trim().min(1, "Your name is required.").max(100, "Name must be 100 characters or fewer."),
  customer_email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address.")),
  rating: z.coerce.number().int().min(1, "Choose a rating from 1 to 5 stars.").max(5, "Choose a rating from 1 to 5 stars."),
  body: z.string().trim().min(10, "Please write at least 10 characters.").max(2000, "Review must be 2000 characters or fewer."),
});

/**
 * Posts a review for a product. Guests may review (no login), but the
 * product must exist and be on sale, and the row is written server-side so
 * the public key can't insert reviews directly.
 */
export async function submitReview(productId, formData) {
  const parsed = schema.safeParse({
    customer_name: formData.get("customer_name"),
    customer_email: formData.get("customer_email"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v[0]])),
    };
  }

  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .maybeSingle();

  if (productError) return { error: productError.message };
  if (!product || product.status !== ACTIVE_STATUS) {
    return { error: "That product is no longer available." };
  }

  const { error } = await createAdminClient()
    .from("product_reviews")
    .insert({ product_id: productId, ...parsed.data });

  if (error) return { error: `Couldn't save your review: ${error.message}` };

  revalidatePath(`/products/${productId}`);
  return { success: true };
}

/**
 * Removes a single review. Deleting a review never touches the product it
 * belongs to — only the product_reviews row is removed.
 */
export async function deleteReview(id) {
  const { error: authError } = await requireAdmin("products");
  if (authError) return { error: authError };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_reviews")
    .delete()
    .eq("id", id)
    .select("id, product_id");

  if (error) return { error: `Couldn't delete the review: ${error.message}` };
  if (!data?.length) return { error: "That review no longer exists." };

  revalidatePath("/admin/reviews");
  revalidatePath(`/products/${data[0].product_id}`);
  return { success: true };
}
