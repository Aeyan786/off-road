"use client";

import { useState, useTransition } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitReview } from "@/actions/reviews";
import { formatBlogDate } from "@/lib/blog-text";
import { cn } from "@/lib/utils";

const INPUT_CLASS =
  "flex w-full rounded-lg border border-neutral-300 bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

/** Read-only star row. */
export function Stars({ rating, className }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-4", n <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-neutral-300")}
        />
      ))}
    </span>
  );
}

function RatingPicker({ value, onChange, error }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="space-y-1.5">
      <Label htmlFor="rating-1">Your rating</Label>
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            id={`rating-${n}`}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            aria-pressed={value === n}
            className="cursor-pointer p-0.5"
          >
            <Star className={cn("size-6 transition-colors", n <= shown ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
          </button>
        ))}
        <span className="ml-2 text-sm text-neutral-500">{value ? `${value}/5` : "Select a rating"}</span>
      </div>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/**
 * Reviews for one product: average, the list, and a "Post a Review" form
 * (guest — name, email, 1–5 stars, text). Validation runs on the server too.
 */
export default function ProductReviews({ productId, reviews, count, average }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("rating", String(rating));
    setErrors({});

    startTransition(async () => {
      const result = await submitReview(productId, formData);
      if (result?.fieldErrors) {
        setErrors(result.fieldErrors);
        return;
      }
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      form.reset();
      setRating(0);
      setOpen(false);
      toast.success("Thanks! Your review has been posted.");
    });
  }

  return (
    <section className="mt-16 border-t pt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Reviews</h2>
          {count > 0 ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
              <Stars rating={average} />
              <span className="font-medium text-neutral-900">{average.toFixed(1)}</span>
              <span className="text-neutral-500">
                from {count} review{count === 1 ? "" : "s"}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-neutral-500">No reviews yet — be the first.</p>
          )}
        </div>
        <Button type="button" className="cursor-pointer rounded-sm px-4" onClick={() => setOpen((v) => !v)}>
          {open ? "Close" : "Post a Review"}
        </Button>
      </div>

      {open ? (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-sm border bg-neutral-50 p-5">
          <RatingPicker value={rating} onChange={setRating} error={errors.rating} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Your name</Label>
              <Input id="customer_name" name="customer_name" aria-invalid={errors.customer_name ? true : undefined} />
              {errors.customer_name ? <p role="alert" className="text-xs text-destructive">{errors.customer_name}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Your email</Label>
              <Input id="customer_email" name="customer_email" type="email" aria-invalid={errors.customer_email ? true : undefined} />
              <p className="text-xs text-neutral-400">Not shown publicly.</p>
              {errors.customer_email ? <p role="alert" className="text-xs text-destructive">{errors.customer_email}</p> : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Your review</Label>
            <textarea
              id="body"
              name="body"
              rows={4}
              className={`${INPUT_CLASS} resize-y`}
              aria-invalid={errors.body ? true : undefined}
            />
            {errors.body ? <p role="alert" className="text-xs text-destructive">{errors.body}</p> : null}
          </div>
          <Button type="submit" disabled={isPending} className="cursor-pointer rounded-sm px-4">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isPending ? "Posting…" : "Post review"}
          </Button>
        </form>
      ) : null}

      {reviews.length > 0 ? (
        <ul className="mt-8 divide-y">
          {reviews.map((review) => (
            <li key={review.id} className="py-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Stars rating={review.rating} />
                <span className="text-sm font-semibold text-neutral-900">{review.customer_name}</span>
                <span className="text-xs text-neutral-400">{formatBlogDate(review.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-700">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
