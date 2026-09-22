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
import { deleteSupplier } from "@/actions/suppliers";

/**
 * Suppliers that still have products can't be deleted (the foreign key is
 * ON DELETE RESTRICT), so the dialog explains that instead of offering a
 * delete that would fail.
 */
export default function DeleteSupplierDialog({ supplier }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const inUse = supplier.productCount > 0;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteSupplier(supplier.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(`"${supplier.name}" was deleted.`);
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
            aria-label={`Delete ${supplier.name}`}
            className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-sm"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {inUse ? `"${supplier.name}" is in use` : `Delete "${supplier.name}"?`}
          </DialogTitle>
          <DialogDescription>
            {inUse
              ? `${supplier.productCount} product${supplier.productCount === 1 ? " uses" : "s use"} this supplier. Move ${supplier.productCount === 1 ? "it" : "them"} to another supplier first, so no product is left without one.`
              : "This supplier has no products. Deleting it cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button className="cursor-pointer rounded-sm px-3" type="button" variant="outline" onClick={() => setOpen(false)}>
            {inUse ? "OK" : "Cancel"}
          </Button>
          {inUse ? null : (
            <Button
              className="cursor-pointer rounded-sm px-3"
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
