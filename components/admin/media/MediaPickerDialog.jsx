"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { AlertCircle, Check, Images, Loader2, Search } from "lucide-react";
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
import { listMedia } from "@/actions/media";
import { cn } from "@/lib/utils";

/**
 * Reusable media-library picker. Loads the library on open, lets the admin
 * pick one or many images, and hands the chosen media rows back through
 * `onSelect`. Not product-specific — any feature that needs an image from
 * the library can drop this in.
 *
 * @param {React.ReactElement} trigger element that opens the dialog
 * @param {boolean} [multiple=true] allow selecting more than one
 * @param {string[]} [alreadySelected] URLs already in use, shown as selected
 * @param {(media: object[]) => void} onSelect receives the chosen media rows
 */
export default function MediaPickerDialog({
  trigger,
  multiple = true,
  alreadySelected = [],
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, startLoading] = useTransition();

  useEffect(() => {
    if (!open) return;

    const timeout = setTimeout(() => {
      startLoading(async () => {
        const result = await listMedia({ search });
        if (result?.error) {
          setError(result.error);
          setMedia([]);
          return;
        }
        setError(null);
        setMedia(result.media ?? []);
      });
    }, search ? 300 : 0);

    return () => clearTimeout(timeout);
  }, [open, search]);

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) {
      setSelectedIds([]);
      setSearch("");
      setError(null);
    }
  }

  function toggle(item) {
    setSelectedIds((previous) => {
      if (previous.includes(item.id)) {
        return previous.filter((id) => id !== item.id);
      }
      return multiple ? [...previous, item.id] : [item.id];
    });
  }

  function handleConfirm() {
    const chosen = media.filter((item) => selectedIds.includes(item.id));
    onSelect?.(chosen);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select from Media</DialogTitle>
          <DialogDescription>
            {multiple
              ? "Choose one or more images from your media library."
              : "Choose an image from your media library."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name..."
            className="pl-9"
          />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <div className="max-h-[22rem] overflow-y-auto rounded-md border p-2">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-400">
              <Loader2 className="size-4 animate-spin" />
              Loading media...
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-neutral-400">
              <Images className="size-7" />
              <p className="text-sm text-neutral-600">
                {search ? "No images match that search." : "Your media library is empty."}
              </p>
              <p className="text-xs">Upload images from the Media page first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {media.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const inUse = alreadySelected.includes(item.file_url);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item)}
                    aria-pressed={isSelected}
                    className={cn("cursor-pointer", 
                      "group relative cursor-pointer overflow-hidden rounded-sm border-2 text-left transition-colors",
                      isSelected ? "border-brand" : "border-transparent hover:border-neutral-300"
                    )}
                  >
                    <div className="relative aspect-square bg-neutral-100">
                      <Image
                        src={item.file_url}
                        alt={item.file_name}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                      {isSelected ? (
                        <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-brand text-white">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                      {inUse && !isSelected ? (
                        <span className="absolute bottom-1 left-1 rounded-sm bg-black/70 px-1 py-0.5 text-[10px] text-white">
                          In use
                        </span>
                      ) : null}
                    </div>
                    <p
                      className="truncate px-1.5 py-1 text-[11px] text-neutral-600"
                      title={item.file_name}
                    >
                      {item.file_name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm px-3 text-xs cursor-pointer"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-sm px-3 text-xs cursor-pointer"
            onClick={handleConfirm}
            disabled={selectedIds.length === 0}
          >
            Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}
            image{selectedIds.length === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
