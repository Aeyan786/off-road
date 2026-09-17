"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import DeleteMediaDialog from "@/components/admin/media/DeleteMediaDialog";
import BulkDeleteMediaDialog from "@/components/admin/media/BulkDeleteMediaDialog";
import { cn } from "@/lib/utils";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaGrid({ media = [] }) {
  const [selectedIds, setSelectedIds] = useState([]);

  // Derived from the current media prop, so ids that have since been deleted
  // (or filtered out by a search) can never linger in the selection.
  const selectedItems = media.filter((item) => selectedIds.includes(item.id));
  const hasSelection = selectedItems.length > 0;
  const allSelected = media.length > 0 && selectedItems.length === media.length;

  function toggleItem(item, checked) {
    setSelectedIds((previous) =>
      checked
        ? [...previous, item.id]
        : previous.filter((id) => id !== item.id)
    );
  }

  function toggleAll(checked) {
    setSelectedIds(checked ? media.map((item) => item.id) : []);
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-16 text-neutral-400">
        <Images className="size-8" />
        <p className="text-sm font-medium text-neutral-600">No media yet</p>
        <p className="text-xs text-neutral-400">
          Upload images above, or import a ZIP archive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600">
          <Checkbox
            checked={allSelected}
            indeterminate={hasSelection && !allSelected}
            onCheckedChange={toggleAll}
            aria-label="Select all images"
            className="cursor-pointer"
          />
          Select all
        </label>

        {hasSelection ? (
          <>
            <span className="text-xs text-neutral-500">
              {selectedItems.length} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer rounded-sm px-3 text-xs"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
            <BulkDeleteMediaDialog
              items={selectedItems}
              onDeleted={() => setSelectedIds([])}
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {media.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <figure
              key={item.id}
              className={cn(
                "group overflow-hidden rounded-md border bg-white transition-colors",
                isSelected ? "border-brand ring-1 ring-brand" : null
              )}
            >
              <div className="relative aspect-square bg-neutral-100">
                <Image
                  src={item.file_url}
                  alt={item.file_name}
                  fill
                  sizes="200px"
                  className="object-cover"
                />

                <span
                  className={cn(
                    "absolute left-1.5 top-1.5 z-10 rounded-sm bg-white/90 p-1 transition-opacity",
                    isSelected || hasSelection
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleItem(item, checked)}
                    aria-label={`Select ${item.file_name}`}
                    className="cursor-pointer"
                  />
                </span>

                <DeleteMediaDialog item={item} />
              </div>
              <figcaption className="space-y-0.5 px-2 py-1.5">
                <p className="truncate text-xs font-medium text-neutral-700" title={item.file_name}>
                  {item.file_name}
                </p>
                <p className="text-[11px] text-neutral-400">{formatBytes(item.file_size)}</p>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
