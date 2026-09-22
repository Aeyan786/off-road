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
import { createCategory, updateCategory } from "@/actions/categories";

const initialState = { error: null };

/**
 * Add a category (top-level, or under `parentId`), or — when `category` is
 * passed — rename that existing category in place.
 */
export default function CategoryFormDialog({ trigger, parentId, parentName, category }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(category?.id);

  const [state, formAction, isPending] = useActionState(async (_prev, formData) => {
    const name = formData.get("name")?.toString() ?? "";
    const result = isEdit
      ? await updateCategory({ id: category.id, name })
      : await createCategory({ name, parentId: parentId || null });

    if (result?.success) {
      setOpen(false);
      if (isEdit) toast.success(`Renamed to "${name.trim()}".`);
    }
    return result ?? initialState;
  }, initialState);

  const title = isEdit ? "Rename Category" : parentId ? "Add Subcategory" : "Add Category";
  const description = isEdit
    ? `Currently "${category.name}". Products and subcategories stay attached, and existing links keep working.`
    : parentId
      ? `This will be added under "${parentName}".`
      : "Top-level categories group subcategories, e.g. \"ATV\".";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={isEdit ? category.name : undefined}
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
