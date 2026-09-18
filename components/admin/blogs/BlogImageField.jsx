"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Images, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import MediaPickerDialog from "@/components/admin/media/MediaPickerDialog";
import { uploadMediaFiles } from "@/actions/media";

/**
 * Single-image field for blogs — the one-image counterpart of
 * ProductImagesField. Uploads go into the media library first (same bucket),
 * so the value is always a public URL. Picking or uploading again replaces
 * the current image.
 *
 * @param {string|null} value current image URL
 * @param {(url: string|null) => void} onChange
 * @param {string} [error] field-level validation message
 */
export default function BlogImageField({ value, onChange, error }) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, startUpload] = useTransition();

  function handleFilePicked(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    startUpload(async () => {
      const formData = new FormData();
      formData.append("files", file);

      const result = await uploadMediaFiles(formData);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (result?.error) {
        setUploadError(result.error);
        return;
      }
      if (result.failed?.length > 0) {
        setUploadError(result.failed.map((f) => `${f.name}: ${f.reason}`).join(" · "));
        return;
      }

      const url = result.media?.[0]?.file_url;
      if (url) onChange(url);
    });
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="group relative aspect-video overflow-hidden rounded-md border bg-neutral-100">
          <Image src={value} alt="Blog image" fill sizes="400px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-neutral-300 py-6 text-center text-xs text-neutral-400">
          No image selected yet.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-sm px-3 text-xs cursor-pointer"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {value ? "Replace from computer" : "Upload from computer"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload blog image"
          onChange={handleFilePicked}
        />

        <MediaPickerDialog
          multiple={false}
          alreadySelected={value ? [value] : []}
          onSelect={(items) => {
            if (items[0]) onChange(items[0].file_url);
          }}
          trigger={
            <Button type="button" variant="outline" className="rounded-sm px-3 text-xs cursor-pointer">
              <Images className="size-3.5" />
              {value ? "Replace from Media" : "Select from Media"}
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
        <p id="image-error" role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
