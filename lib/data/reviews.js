import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Product reviews (0012_refunds_reviews_analytics.sql). Guest reviews: a
 * name and email, no account — the storefront has no customer logins.
 * Reads are public; writes go through actions/reviews.js on the server.
 */
export async function getProductReviews(supabase, productId) {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, customer_name, rating, body, created_at")
    .eq("product_id", productId)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const count = data.length;
  const average = count ? data.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  return { reviews: data, count, average: Math.round(average * 10) / 10 };
}

/**
 * Every review for the admin moderation page, newest first. The product is
 * read through the existing product_id relationship rather than copied onto
 * the review. Reviewer emails are personal data, so this uses the
 * service-role client — callers must already have checked admin access.
 */
export async function getAllReviews() {
  const { data, error } = await createAdminClient()
    .from("product_reviews")
    .select(
      "id, product_id, customer_name, customer_email, rating, body, published, created_at, products ( id, product, sku, images, price, discount_price, status )"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map(({ products, ...review }) => ({
    ...review,
    product: products
      ? {
          id: products.id,
          name: products.product,
          sku: products.sku,
          image: products.images?.[0] ?? null,
          price: products.discount_price ?? products.price,
          status: products.status,
        }
      : null,
  }));
}
