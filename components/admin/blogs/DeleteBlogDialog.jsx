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
import { deleteBlog } from "@/actions/blogs";

export default function DeleteBlogDialog({ blog }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteBlog(blog.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(`"${blog.title}" was deleted.`);
      if (result.warning) toast.warning(result.warning);
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
            aria-label={`Delete ${blog.title}`}
            className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-sm"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{blog.title}&quot;?</DialogTitle>
          <DialogDescription>
            This permanently removes the article. Its image is also deleted
            from the media library, unless a product or another blog is still
            using it. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button className="cursor-pointer rounded-sm px-3" type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="cursor-pointer rounded-sm px-3"
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
