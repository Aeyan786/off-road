"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setProductStatus } from "@/actions/products";
import { cn } from "@/lib/utils";

/**
 * Publishes or unpublishes a product from the listing row. Optimistic: the
 * select shows the new value immediately and rolls back if the write fails.
 */
export default function ProductStatusSelect({ product }) {
  const [status, setStatus] = useState(product.status ?? "active");
  const [isPending, startTransition] = useTransition();

  function handleChange(event) {
    const next = event.target.value;
    const previous = status;
    setStatus(next);

    startTransition(async () => {
      const result = await setProductStatus(product.id, next);
      if (result?.error) {
        setStatus(previous);
        toast.error(result.error);
        return;
      }
      toast.success(
        next === "active"
          ? `"${product.product}" is live on the website.`
          : `"${product.product}" is now a draft and hidden from the website.`
      );
    });
  }

  // Derived from stock rather than stored: the product keeps its real
  // active/draft status, and the badge clears itself once restocked.
  const outOfStock = (product.quantity ?? 0) <= 0;

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        value={status}
        onChange={handleChange}
        disabled={isPending}
        aria-label={`Status for ${product.product}`}
        className={cn(
          "h-7 cursor-pointer rounded-sm border px-1.5 text-xs font-medium outline-none focus-visible:border-ring disabled:opacity-60",
          status === "active"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-neutral-300 bg-neutral-100 text-neutral-600"
        )}
      >
        <option value="active">Active</option>
        <option value="draft">Draft</option>
      </select>

      {outOfStock ? (
        <span className="rounded-sm border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">
          Out of stock
        </span>
      ) : null}
    </div>
  );
}
