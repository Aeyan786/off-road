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
import { deleteMediaItems } from "@/actions/media";

/**
 * Confirms deletion of the media items currently selected in the library.
 *
 * @param {object[]} items the selected media rows
 * @param {() => void} [onDeleted] clears the selection afterwards
 */
export default function BulkDeleteMediaDialog({ items, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const count = items.length;

  function handleDelete(event) {
    // Keep the dialog open so a failure stays visible.
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await deleteMediaItems(items.map((item) => item.id));
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
            Delete {count} image{count === 1 ? "" : "s"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This removes {count === 1 ? "the file" : "these files"} from storage and the
            media library. Any product already using{" "}
            {count === 1 ? "it" : "them"} will lose the image. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="max-h-40 space-y-1 overflow-y-auto rounded-sm bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          {items.map((item) => (
            <li key={item.id} className="truncate">
              {item.file_name}
            </li>
          ))}
        </ul>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <AlertDialogFooter>
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
            Delete {count === 1 ? "image" : "images"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
