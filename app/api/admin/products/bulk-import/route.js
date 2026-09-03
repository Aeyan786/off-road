import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveCategoryPath } from "@/lib/server/resolveCategoryPath";
import { REQUIRED_PRODUCT_FIELD_KEYS, CATEGORY_FIELD_KEYS } from "@/lib/product-fields";

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(value) {
  const trimmed = value?.toString().trim();
  return trimmed ? trimmed : null;
}

/**
 * Bulk product import. Runs as a plain Route Handler (JSON in, JSON out)
 * rather than a Server Action — large arrays of spreadsheet-parsed rows can
 * fail Next's "plain object" check for Server Action arguments after a dev
 * hot-reload, since it compares prototype identity across module reloads.
 * A normal fetch()+JSON body sidesteps that entirely.
 *
 * For each row, whichever of category_level1/2/3 are mapped and non-empty
 * are resolved into the categories tree (find-or-create per level, case
 * insensitive) and the product attaches to the deepest level given. Rows
 * missing a required field, or with an invalid price, are skipped and
 * reported rather than failing the whole batch. Existing SKUs are updated
 * in place (upsert).
 */
export async function POST(request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const rows = Array.isArray(body?.rows) ? body.rows : null;
  const mapping = body?.mapping && typeof body.mapping === "object" ? body.mapping : null;

  if (!rows || !mapping) {
    return NextResponse.json(
      { error: "Request must include `rows` (array) and `mapping` (object)." },
      { status: 400 }
    );
  }

  const mappedFields = Object.entries(mapping).filter(([, field]) => field);
  const skipped = [];
  const pending = [];

  rows.forEach((row, index) => {
    const record = {};
    for (const [header, field] of mappedFields) {
      record[field] = row[header];
    }

    const missing = REQUIRED_PRODUCT_FIELD_KEYS.filter(
      (key) => !toStringOrNull(record[key])
    );
    if (missing.length > 0) {
      skipped.push({
        row: index + 2,
        reason: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`,
      });
      return;
    }

    const price = toNumberOrNull(record.price);
    if (price === null) {
      skipped.push({ row: index + 2, reason: `Invalid price: "${record.price}"` });
      return;
    }

    const categoryNames = CATEGORY_FIELD_KEYS.map((key) => toStringOrNull(record[key])).filter(
      Boolean
    );

    pending.push({
      index,
      categoryNames,
      payload: {
        product: record.product.toString().trim(),
        sku: record.sku.toString().trim(),
        price,
        quantity: toNumberOrNull(record.quantity) ?? 0,
        supplier: toStringOrNull(record.supplier),
        manufacturer: toStringOrNull(record.manufacturer),
        model: toStringOrNull(record.model),
        year: toStringOrNull(record.year),
        description: toStringOrNull(record.description),
        small_description: toStringOrNull(record.small_description),
        additional_information: toStringOrNull(record.additional_information),
        width: toNumberOrNull(record.width),
        length: toNumberOrNull(record.length),
        height: toNumberOrNull(record.height),
        weight_grams: toNumberOrNull(record.weight_grams),
        images: toStringOrNull(record.images)
          ? record.images
              .toString()
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      },
    });
  });

  const categoryCache = new Map();
  let categoriesCreated = 0;
  const payloads = [];

  try {
    for (const item of pending) {
      let categoryId = null;
      if (item.categoryNames.length > 0) {
        const resolved = await resolveCategoryPath(
          supabase,
          item.categoryNames,
          categoryCache
        );
        categoryId = resolved.id;
        categoriesCreated += resolved.created;
      }
      payloads.push({ ...item.payload, categories: categoryId });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (payloads.length === 0) {
    return NextResponse.json({ imported: 0, categoriesCreated, skipped });
  }

  const { error: upsertError } = await supabase
    .from("products")
    .upsert(payloads, { onConflict: "sku" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ imported: payloads.length, categoriesCreated, skipped });
}
