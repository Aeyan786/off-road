"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const IMAGE_BUCKET = "product_bucket";

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(value) {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : null;
}

async function uploadImageFiles(supabase, files) {
  const urls = [];
  for (const file of files) {
    if (!file || typeof file === "string" || file.size === 0) continue;

    const ext = file.name?.split(".").pop() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new Error(`Image upload failed: ${error.message}`);

    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

/**
 * Builds the products row payload from a <form> FormData. Shared by create
 * and update so both stay in sync with the schema.
 */
async function buildProductPayload(supabase, formData) {
  const newImageFiles = formData.getAll("imageFiles");
  const uploadedUrls = await uploadImageFiles(supabase, newImageFiles);

  const keptImages = formData.get("existingImages");
  const existingUrls = keptImages ? JSON.parse(keptImages) : [];

  return {
    product: formData.get("product")?.toString().trim(),
    sku: formData.get("sku")?.toString().trim(),
    categories: toStringOrNull(formData.get("categories")),
    supplier: toStringOrNull(formData.get("supplier")),
    manufacturer: toStringOrNull(formData.get("manufacturer")),
    model: toStringOrNull(formData.get("model")),
    year: toStringOrNull(formData.get("year")),
    description: toStringOrNull(formData.get("description")),
    small_description: toStringOrNull(formData.get("small_description")),
    additional_information: toStringOrNull(
      formData.get("additional_information"),
    ),
    price: toNumberOrNull(formData.get("price")) ?? 0,
    quantity: toNumberOrNull(formData.get("quantity")) ?? 0,
    width: toNumberOrNull(formData.get("width")),
    length: toNumberOrNull(formData.get("length")),
    height: toNumberOrNull(formData.get("height")),
    weight_grams: toNumberOrNull(formData.get("weight_grams")),
    images: [...existingUrls, ...uploadedUrls],
  };
}

export async function createProduct(formData) {
  const supabase = await createClient();

  try {
    const payload = await buildProductPayload(supabase, formData);

    if (!payload.product || !payload.sku) {
      return { error: "Product name and SKU are required." };
    }

    const { error } = await supabase.from("products").insert(payload);
    if (error) return { error: error.message };
  } catch (err) {
    return { error: err.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function updateProduct(id, formData) {
  const supabase = await createClient();

  try {
    const payload = await buildProductPayload(supabase, formData);

    if (!payload.product || !payload.sku) {
      return { error: "Product name and SKU are required." };
    }

    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id);
    if (error) return { error: error.message };
  } catch (err) {
    return { error: err.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(id) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBulk() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .not("id", "is", null);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

// Bulk import lives in app/api/admin/products/bulk-import/route.js (a plain
// Route Handler, not a Server Action) — see that file for why.
