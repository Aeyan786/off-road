"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupplier, updateSupplier } from "@/actions/suppliers";

const initialState = { error: null, fieldErrors: {} };

/** Create a supplier, or — when `supplier` is passed — rename it in place. */
export default function SupplierFormDialog({ trigger, supplier }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(supplier?.id);

  const [state, formAction, isPending] = useActionState(async (_prev, formData) => {
    const name = formData.get("name")?.toString() ?? "";
    const result = isEdit
      ? await updateSupplier({ id: supplier.id, name })
      : await createSupplier({ name });

    if (result?.success) {
      setOpen(false);
      toast.success(isEdit ? `Supplier renamed to "${result.name}".` : `Supplier "${result.name}" created.`);
      return initialState;
    }
    return { error: result?.error ?? null, fieldErrors: result?.fieldErrors ?? {} };
  }, initialState);

  const nameError = state?.fieldErrors?.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Supplier" : "Create Supplier"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Renaming updates all ${supplier.productCount ?? 0} product${supplier.productCount === 1 ? "" : "s"} using this supplier.`
              : "Add a supplier you source products from."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier-name">Name</Label>
            <Input
              id="supplier-name"
              name="name"
              required
              maxLength={120}
              defaultValue={isEdit ? supplier.name : undefined}
              placeholder="e.g. FMF Racing"
              autoFocus
              aria-invalid={nameError ? true : undefined}
              aria-describedby={nameError ? "supplier-name-error" : undefined}
            />
            {nameError ? (
              <p id="supplier-name-error" role="alert" className="text-xs text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>

          {state?.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <DialogFooter>
            <Button className="cursor-pointer rounded-sm px-3" type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="cursor-pointer rounded-sm px-3" type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
