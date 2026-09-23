import { MessageSquareText, Package, Star } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import ReviewsDataTable from "@/components/admin/reviews/ReviewsDataTable";
import { getAllReviews } from "@/lib/data/reviews";

export const metadata = {
  title: "Product Reviews",
};

export default async function AdminReviewsPage() {
  let reviews = [];
  let setupError = null;
  try {
    reviews = await getAllReviews();
  } catch (err) {
    setupError = err.message;
  }

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const products = new Set(reviews.map((r) => r.product_id)).size;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Product Reviews" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Product Reviews</h1>
        <p className="text-sm text-neutral-500">
          Every review customers have posted, newest first. Deleting a review removes it from
          the product page immediately — the product itself is untouched.
        </p>
      </div>

      {setupError ? (
        <SetupRequiredBanner message={setupError} migration="0012_refunds_reviews_analytics.sql" />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Reviews"
          value={reviews.length}
          hint="Posted by customers"
          icon={MessageSquareText}
        />
        <StatCard
          title="Average Rating"
          value={reviews.length ? `${average.toFixed(1)} / 5` : "—"}
          hint={reviews.length ? "Across all reviews" : "No ratings yet"}
          icon={Star}
        />
        <StatCard
          title="Products Reviewed"
          value={products}
          hint="Products with at least one review"
          icon={Package}
        />
      </div>

      <ReviewsDataTable reviews={reviews} />
    </div>
  );
}
