import { createClient } from "@/lib/supabase/server";
import { getMedia } from "@/lib/data/media";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import MediaUploader from "@/components/admin/media/MediaUploader";
import MediaGrid from "@/components/admin/media/MediaGrid";
import MediaSearch from "@/components/admin/media/MediaSearch";

export const metadata = {
  title: "Media",
};

export default async function MediaPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  let media = [];
  try {
    media = await getMedia(supabase, { search: params?.search, limit: 200 });
  } catch (err) {
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Media" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Media</h1>
        <p className="text-sm text-neutral-500">
          Images available to any product. Upload them individually or import
          a ZIP archive. File names must be unique — spreadsheet imports use
          them to match images to products.
        </p>
      </div>


      <MediaUploader />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-neutral-900">
            Library{media.length > 0 ? ` (${media.length})` : ""}
          </h2>
          <MediaSearch />
        </div>
        <MediaGrid media={media} />
      </div>
    </div>
  );
}
