import Image from "next/image";
import { Images } from "lucide-react";
import DeleteMediaDialog from "@/components/admin/media/DeleteMediaDialog";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaGrid({ media = [] }) {
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {media.map((item) => (
        <figure key={item.id} className="group overflow-hidden rounded-md border bg-white">
          <div className="relative aspect-square bg-neutral-100">
            <Image
              src={item.file_url}
              alt={item.file_name}
              fill
              sizes="200px"
              className="object-cover"
            />
            <DeleteMediaDialog item={item} />
          </div>
          <figcaption className="space-y-0.5 px-2 py-1.5">
            <p className="truncate text-xs font-medium text-neutral-700" title={item.file_name}>
              {item.file_name}
            </p>
            <p className="text-[11px] text-neutral-400">{formatBytes(item.file_size)}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
