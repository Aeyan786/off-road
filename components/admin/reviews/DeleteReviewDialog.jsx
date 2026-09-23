"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteReview } from "@/actions/reviews";

export default function DeleteReviewDialog({ review }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(review.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(`Review by ${review.customer_name} was deleted.`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Delete review by ${review.customer_name}`}
            className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-sm"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this review?</DialogTitle>
          <DialogDescription>
            The {review.rating}-star review by {review.customer_name} will be removed from
            {review.product ? ` "${review.product.name}"` : " its product"} and will no longer
            appear on the storefront. The product itself is not affected. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-sm border bg-neutral-50 p-3 text-sm text-neutral-600">
          {review.body}
        </p>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-sm"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Keep review
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer rounded-sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-3.5" />}
            {isPending ? "Deleting…" : "Delete review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
