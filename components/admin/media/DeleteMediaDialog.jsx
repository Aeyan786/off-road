"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
import { deleteMedia } from "@/actions/media";

export default function DeleteMediaDialog({ item }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteMedia(item.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={`Delete ${item.file_name}`}
            className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-sm bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{item.file_name}&quot;?</DialogTitle>
          <DialogDescription>
            This removes the file from storage and the media library. Any
            product already using this image will lose it. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm px-3 text-xs cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-sm px-3 text-xs cursor-pointer"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
