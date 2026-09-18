"use server";

import { revalidatePath } from "next/cache";
import JSZip from "jszip";
import { requireAdmin } from "@/lib/server/requireAdmin";
import {
  detachMediaUrlsFromBlogs,
  detachMediaUrlsFromProducts,
} from "@/lib/server/detachMediaUrls";
import { getMedia, getMediaByFileNames } from "@/lib/data/media";

// Media files live alongside product images in the existing bucket, under a
// `media/` prefix. Do not point this at a new bucket.
const MEDIA_BUCKET = "product_bucket";
const MEDIA_PREFIX = "media";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "bmp"];
const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
};

/**
 * Also refreshes product/blog views when a delete rewrote any product's
 * images or cleared a blog's image.
 */
function revalidateMediaViews(productsUpdated = 0, blogsUpdated = 0) {
  revalidatePath("/admin/media");
  if (productsUpdated > 0) {
    revalidatePath("/admin/products");
    revalidatePath("/");
  }
  if (blogsUpdated > 0) {
    revalidatePath("/admin/blogs");
    revalidatePath("/blogs", "layout");
    revalidatePath("/");
  }
}

function extensionOf(fileName) {
  const match = /\.([^.]+)$/.exec(fileName ?? "");
  return match ? match[1].toLowerCase() : "";
}

function isImageFileName(fileName) {
  return IMAGE_EXTENSIONS.includes(extensionOf(fileName));
}

function baseName(path) {
  return path.split(/[\\/]/).pop() ?? "";
}

/** Skips macOS resource forks, hidden files and other archive noise. */
function isJunkEntry(entryPath) {
  const name = baseName(entryPath);
  return (
    entryPath.includes("__MACOSX") ||
    name.startsWith(".") ||
    name === "Thumbs.db"
  );
}

/**
 * File names are the key the spreadsheet importer maps products onto, so
 * they have to stay unique (case-insensitively). Returns a Set of
 * lower-cased names that are already taken, either in the library or
 * earlier in this same batch.
 */
async function findTakenNames(supabase, fileNames) {
  const existing = await getMediaByFileNames(supabase, fileNames);
  return new Set(existing.keys());
}

/**
 * Uploads one file's bytes to storage and returns the row to insert into
 * `media`. Throws with a readable message so callers can report per-file.
 */
async function putFile(supabase, { fileName, body, contentType, size }) {
  const extension = extensionOf(fileName) || "bin";
  const storagePath = `${MEDIA_PREFIX}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, body, {
      contentType: contentType || MIME_BY_EXTENSION[extension] || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);

  return {
    file_name: fileName,
    storage_path: storagePath,
    file_url: data.publicUrl,
    file_type: contentType || MIME_BY_EXTENSION[extension] || null,
    file_size: size ?? null,
  };
}

/**
 * Inserts the metadata rows for files already written to storage. If the
 * insert fails the storage objects are removed again so nothing is
 * orphaned. A unique-violation means another upload claimed the same file
 * name in between the pre-check and here.
 */
async function insertMediaRows(supabase, rows) {
  const { data, error } = await supabase.from("media").insert(rows).select();

  if (error) {
    await supabase.storage
      .from(MEDIA_BUCKET)
      .remove(rows.map((row) => row.storage_path));

    return {
      error:
        error.code === "23505"
          ? "One of those file names was already taken. Nothing was saved — rename the file or delete the existing one, then try again."
          : error.message,
    };
  }

  return { data };
}

/**
 * Uploads one or many images picked from the admin's computer.
 * FormData field: `files` (repeatable).
 */
export async function uploadMediaFiles(formData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const files = formData.getAll("files").filter((f) => f && typeof f !== "string" && f.size > 0);
  if (files.length === 0) return { error: "No files were selected." };

  const rows = [];
  const failed = [];

  let taken;
  try {
    taken = await findTakenNames(
      supabase,
      files.map((file) => baseName(file.name))
    );
  } catch (err) {
    return { error: err.message };
  }

  for (const file of files) {
    const fileName = baseName(file.name);

    if (!isImageFileName(fileName)) {
      failed.push({ name: fileName, reason: "Not a supported image type." });
      continue;
    }
    if (taken.has(fileName.toLowerCase())) {
      failed.push({
        name: fileName,
        reason: "A file with this name is already in the library.",
      });
      continue;
    }

    try {
      rows.push(
        await putFile(supabase, {
          fileName,
          body: file,
          contentType: file.type,
          size: file.size,
        })
      );
      taken.add(fileName.toLowerCase());
    } catch (err) {
      failed.push({ name: fileName, reason: err.message });
    }
  }

  if (rows.length === 0) {
    return { uploaded: 0, failed, media: [] };
  }

  const { data, error } = await insertMediaRows(supabase, rows);
  if (error) return { error };

  revalidatePath("/admin/media");
  return { uploaded: data.length, failed, media: data };
}

/**
 * Bulk upload: extracts every image out of a ZIP archive and stores each one
 * as its own media item. Folder structure inside the archive is flattened;
 * non-image entries and archive noise are skipped and reported.
 * FormData field: `file` (a single .zip).
 */
export async function uploadMediaZip(formData) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) {
    return { error: "No ZIP file was selected." };
  }
  if (extensionOf(file.name) !== "zip") {
    return { error: `"${file.name}" is not a .zip file.` };
  }

  let zip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch (err) {
    return { error: `Could not read the ZIP file: ${err.message}` };
  }

  const entries = Object.values(zip.files).filter(
    (entry) => !entry.dir && !isJunkEntry(entry.name)
  );

  const rows = [];
  const failed = [];
  let skipped = 0;

  let taken;
  try {
    taken = await findTakenNames(
      supabase,
      entries.map((entry) => baseName(entry.name))
    );
  } catch (err) {
    return { error: err.message };
  }

  for (const entry of entries) {
    const fileName = baseName(entry.name);
    if (!isImageFileName(fileName)) {
      skipped += 1;
      continue;
    }
    if (taken.has(fileName.toLowerCase())) {
      failed.push({
        name: fileName,
        reason: "A file with this name is already in the library.",
      });
      continue;
    }

    try {
      const bytes = await entry.async("uint8array");
      rows.push(
        await putFile(supabase, {
          fileName,
          body: bytes,
          contentType: MIME_BY_EXTENSION[extensionOf(fileName)],
          size: bytes.byteLength,
        })
      );
      // Guards against the same name appearing twice inside one archive.
      taken.add(fileName.toLowerCase());
    } catch (err) {
      failed.push({ name: fileName, reason: err.message });
    }
  }

  if (rows.length === 0) {
    return { uploaded: 0, skipped, failed, media: [] };
  }

  const { data, error } = await insertMediaRows(supabase, rows);
  if (error) return { error };

  revalidatePath("/admin/media");
  return { uploaded: data.length, skipped, failed, media: data };
}

/**
 * Removes the stored file, its metadata row, and the image URL from any
 * product that was using it.
 */
export async function deleteMedia(id) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: item, error: findError } = await supabase
    .from("media")
    .select("id, storage_path, file_url")
    .eq("id", id)
    .maybeSingle();

  if (findError) return { error: findError.message };
  if (!item) return { error: "That media item no longer exists." };

  // Detach first: if this fails nothing has been destroyed yet.
  let productsUpdated = 0;
  let blogsUpdated = 0;
  try {
    ({ productsUpdated } = await detachMediaUrlsFromProducts(supabase, [item.file_url]));
    ({ blogsUpdated } = await detachMediaUrlsFromBlogs(supabase, [item.file_url]));
  } catch (err) {
    return { error: `Could not update products or blogs using this image: ${err.message}` };
  }

  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove([item.storage_path]);
  if (storageError) return { error: `Could not delete the file: ${storageError.message}` };

  const { error: deleteError } = await supabase.from("media").delete().eq("id", id);
  if (deleteError) return { error: deleteError.message };

  revalidateMediaViews(productsUpdated, blogsUpdated);
  return { success: true, productsUpdated, blogsUpdated };
}

/**
 * Removes several media items at once — the files, their metadata rows, and
 * their URLs from any product that was using them. Only the ids the admin
 * selected are touched.
 */
export async function deleteMediaItems(ids) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const mediaIds = (Array.isArray(ids) ? ids : []).filter(Boolean);
  if (mediaIds.length === 0) return { error: "No media was selected." };

  const { data: items, error: findError } = await supabase
    .from("media")
    .select("id, storage_path, file_url")
    .in("id", mediaIds);

  if (findError) return { error: findError.message };
  if (items.length === 0) return { error: "Those media items no longer exist." };

  // Detach first: if this fails nothing has been destroyed yet.
  let productsUpdated = 0;
  let blogsUpdated = 0;
  const urls = items.map((item) => item.file_url);
  try {
    ({ productsUpdated } = await detachMediaUrlsFromProducts(supabase, urls));
    ({ blogsUpdated } = await detachMediaUrlsFromBlogs(supabase, urls));
  } catch (err) {
    return { error: `Could not update products or blogs using these images: ${err.message}` };
  }

  const { error: storageError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .remove(items.map((item) => item.storage_path));
  if (storageError) {
    return { error: `Could not delete the files: ${storageError.message}` };
  }

  const { error: deleteError } = await supabase
    .from("media")
    .delete()
    .in(
      "id",
      items.map((item) => item.id)
    );
  if (deleteError) return { error: deleteError.message };

  revalidateMediaViews(productsUpdated, blogsUpdated);
  return { success: true, deleted: items.length, productsUpdated, blogsUpdated };
}

/** Used by the media picker dialog to search the library on demand. */
export async function listMedia({ search } = {}) {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  try {
    const media = await getMedia(supabase, { search, limit: 200 });
    return { media };
  } catch (err) {
    return { error: err.message };
  }
}
