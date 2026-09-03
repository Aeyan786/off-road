"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { createCategory } from "@/actions/categories";

const initialState = { error: null };

export default function CategoryFormDialog({ trigger, parentId, parentName }) {
  const [open, setOpen] = useState(false);

  const [state, formAction, isPending] = useActionState(async (_prev, formData) => {
    const result = await createCategory({
      name: formData.get("name")?.toString() ?? "",
      parentId: parentId || null,
    });
    if (result?.success) setOpen(false);
    return result ?? initialState;
  }, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {parentId ? `Add Subcategory` : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {parentId
              ? `This will be added under "${parentName}".`
              : "Top-level categories group subcategories, e.g. \"ATV\"."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder={parentId ? "e.g. ATV Exhaust" : "e.g. ATV"}
              autoFocus
            />
          </div>

          {state?.error ? (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
