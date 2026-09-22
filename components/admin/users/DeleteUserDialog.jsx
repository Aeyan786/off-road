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
import { deleteAdminUser } from "@/actions/users";

export default function DeleteUserDialog({ user }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const name = user.fullName || user.email;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAdminUser(user.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(`${name} was deleted.`);
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
            aria-label={`Delete ${name}`}
            className="text-destructive hover:bg-destructive/10 cursor-pointer rounded-sm"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            Their login ({user.email}) is removed and they&apos;re signed out
            of the admin straight away. Products and content they created are
            not affected. This cannot be undone.
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
