const PRODUCT_COLUMNS = `
  id,
  categories ( id, name, slug, parent:parent_id ( id, name, slug, parent:parent_id ( id, name, slug ) ) ),
  supplier,
  manufacturer,
  model,
  year,
  product,
  description,
  images,
  sku,
  width,
  length,
  height,
  weight_grams,
  price,
  quantity,
  small_description,
  additional_information,
  created_at,
  updated_at
`;

/**
 * @param {object} [filters]
 * @param {string} [filters.search] matches product name, SKU, manufacturer
 * @param {string} [filters.categoryId] subcategory id
 * @param {number} [filters.limit]
 */
export async function getProducts(supabase, filters = {}) {
  let query = supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, "");
    query = query.or(
      `product.ilike.%${term}%,sku.ilike.%${term}%,manufacturer.ilike.%${term}%,supplier.ilike.%${term}%`
    );
  }

  if (filters.categoryId) {
    query = query.eq("categories", filters.categoryId);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(supabase, id) {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Breadcrumb string ("ATV / ATV Exhaust / Slip-On") from an embedded category. */
export function categoryPath(category) {
  if (!category) return null;
  const parts = [category.name];
  let current = category;
  while (current.parent) {
    current = current.parent;
    parts.unshift(current.name);
  }
  return parts.join(" / ");
}

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Maps a DB product row to the shape ProductCard expects. */
export function toStorefrontProduct(row) {
  return {
    id: row.id,
    vendor: row.supplier || row.manufacturer || "",
    title: row.product,
    price: priceFormatter.format(row.price ?? 0),
    image: row.images?.[0] ?? null,
  };
}

/** Distinct, non-empty supplier names actually present on products. */
export async function getDistinctSuppliers(supabase) {
  const { data, error } = await supabase
    .from("products")
    .select("supplier")
    .not("supplier", "is", null)
    .neq("supplier", "");

  if (error) throw error;

  return Array.from(new Set(data.map((row) => row.supplier))).sort((a, b) =>
    a.localeCompare(b)
  );
}
