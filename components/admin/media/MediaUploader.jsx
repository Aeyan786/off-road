"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadMediaFiles, uploadMediaZip } from "@/actions/media";
import { cn } from "@/lib/utils";

const IMAGE_ACCEPT = "image/*";
const ZIP_ACCEPT = ".zip";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Dropzone({ id, accept, multiple, icon: Icon, title, hint, files, onFiles, onClear }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          onFiles(Array.from(e.dataTransfer.files ?? []));
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragActive ? "border-brand bg-brand/5" : "border-neutral-300 hover:border-neutral-400"
        )}
      >
        <Icon className="size-6 text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700">{title}</p>
        <p className="text-xs text-neutral-400">{hint}</p>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {files.length > 0 ? (
        <ul className="space-y-1 rounded-md border bg-neutral-50 p-2">
          {files.map((file) => (
            <li key={file.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-neutral-700">{file.name}</span>
              <span className="shrink-0 text-neutral-400">{formatBytes(file.size)}</span>
            </li>
          ))}
          <li className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                onClear();
              }}
              className="flex cursor-pointer items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800"
            >
              <X className="size-3" />
              Clear selection
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

function ResultNotice({ result }) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <p>{result.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 rounded-md bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
      <p className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="size-4 shrink-0" />
        Uploaded {result.uploaded} file{result.uploaded === 1 ? "" : "s"}.
      </p>
      {result.skipped > 0 ? (
        <p className="pl-6 text-emerald-700">
          Skipped {result.skipped} non-image entr{result.skipped === 1 ? "y" : "ies"}.
        </p>
      ) : null}
      {result.failed?.length > 0 ? (
        <ul className="max-h-28 space-y-0.5 overflow-y-auto pl-6 text-amber-700">
          {result.failed.map((f) => (
            <li key={f.name}>
              {f.name}: {f.reason}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function MediaUploader() {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isPending, startTransition] = useTransition();

  function runUpload(action, buildFormData, onDone) {
    setResult(null);
    startTransition(async () => {
      const formData = new FormData();
      buildFormData(formData);
      const response = await action(formData);
      setResult(response);
      if (!response?.error) {
        onDone();
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Media</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <Dropzone
            id="media-images"
            accept={IMAGE_ACCEPT}
            multiple
            icon={ImageIcon}
            title="Upload images"
            hint="Select or drop one or more images"
            files={imageFiles}
            onFiles={(files) => setImageFiles(files)}
            onClear={() => setImageFiles([])}
          />
          <Button
            type="button"
            className="rounded-sm px-3 text-xs"
            disabled={imageFiles.length === 0 || isPending}
            onClick={() =>
              runUpload(
                uploadMediaFiles,
                (formData) => imageFiles.forEach((file) => formData.append("files", file)),
                () => setImageFiles([])
              )
            }
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
            Upload {imageFiles.length > 0 ? `${imageFiles.length} image${imageFiles.length === 1 ? "" : "s"}` : "images"}
          </Button>
        </div>

        <div className="space-y-3">
          <Dropzone
            id="media-zip"
            accept={ZIP_ACCEPT}
            multiple={false}
            icon={FileArchive}
            title="Bulk upload from ZIP"
            hint="Every image inside the archive is added to the library"
            files={zipFile ? [zipFile] : []}
            onFiles={(files) => setZipFile(files[0] ?? null)}
            onClear={() => setZipFile(null)}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-sm px-3 text-xs"
            disabled={!zipFile || isPending}
            onClick={() =>
              runUpload(
                uploadMediaZip,
                (formData) => formData.append("file", zipFile),
                () => setZipFile(null)
              )
            }
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <FileArchive className="size-3.5" />}
            Import ZIP
          </Button>
        </div>

        <div className="lg:col-span-2">
          <ResultNotice result={result} />
        </div>
      </CardContent>
    </Card>
  );
}
