"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteProducts } from "@/actions/products";

/**
 * Confirms deletion of the products currently selected in the listing.
 *
 * @param {object[]} products the selected product rows
 * @param {() => void} [onDeleted] clears the table selection afterwards
 */
export default function BulkDeleteProductsDialog({ products, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const count = products.length;

  function handleDelete(event) {
    // Keep the dialog open so a failure stays visible.
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await deleteProducts(products.map((product) => product.id));
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      onDeleted?.();
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer rounded-sm px-3 text-xs"
          >
            <Trash2 className="size-3.5" />
            Delete {count} selected
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count} product{count === 1 ? "" : "s"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes {count === 1 ? "this product" : "these products"} from
            your catalog. Images stay in the media library. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="max-h-40 space-y-1 overflow-y-auto rounded-sm bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          {products.map((product) => (
            <li key={product.id} className="truncate">
              {product.product}
              <span className="text-neutral-400"> · {product.sku}</span>
            </li>
          ))}
        </ul>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
          {/* AlertDialogAction/Cancel already render a Button, so variant and
              className go straight on them rather than a nested Button. */}
          <AlertDialogCancel className="cursor-pointer rounded-sm px-3 text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            variant="destructive"
            className="cursor-pointer rounded-sm px-3 text-xs"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Delete {count === 1 ? "product" : "products"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
