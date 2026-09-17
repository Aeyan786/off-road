"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Images, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaPickerDialog from "@/components/admin/media/MediaPickerDialog";
import { uploadMediaFiles } from "@/actions/media";

/**
 * Product image manager, shared by the new and edit product pages.
 *
 * Images are held as an ordered list of public URLs (matching the
 * products.images column). Files picked from the admin's computer are
 * uploaded into the media library first, so anything attached to a product
 * is also reusable from Media.
 *
 * @param {string[]} value current image URLs
 * @param {(urls: string[]) => void} onChange
 * @param {string} [error] field-level validation message
 */
export default function ProductImagesField({ value = [], onChange, error }) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, startUpload] = useTransition();

  function addUrls(urls) {
    const next = [...value];
    for (const url of urls) {
      if (!next.includes(url)) next.push(url);
    }
    onChange(next);
  }

  function removeUrl(url) {
    onChange(value.filter((item) => item !== url));
  }

  function handleFilesPicked(event) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);
    startUpload(async () => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const result = await uploadMediaFiles(formData);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (result?.error) {
        setUploadError(result.error);
        return;
      }

      addUrls((result.media ?? []).map((item) => item.file_url));

      if (result.failed?.length > 0) {
        setUploadError(
          result.failed.map((f) => `${f.name}: ${f.reason}`).join(" · ")
        );
      }
    });
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-md border bg-neutral-100"
            >
              <Image src={url} alt="" fill sizes="150px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-neutral-300 py-6 text-center text-xs text-neutral-400">
          No images selected yet.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-sm px-3 text-xs"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          Upload from computer
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={handleFilesPicked}
        />

        <MediaPickerDialog
          alreadySelected={value}
          onSelect={(items) => addUrls(items.map((item) => item.file_url))}
          trigger={
            <Button type="button" variant="outline" className="rounded-sm px-3 text-xs">
              <Images className="size-3.5" />
              Select from Media
            </Button>
          }
        />
      </div>

      {uploadError ? (
        <p role="alert" className="text-xs text-destructive">
          {uploadError}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
