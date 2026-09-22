/**
 * Suppliers are their own table; products point at one via
 * products.supplier_id (ON DELETE RESTRICT — see 0007_suppliers_admin_users.sql).
 */

/** Admin listing: every supplier with how many products use it. */
export async function getSuppliersWithCounts(supabase) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, created_at, updated_at, products(count)")
    .order("name", { ascending: true });

  if (error) throw error;

  return data.map(({ products, ...supplier }) => ({
    ...supplier,
    productCount: products?.[0]?.count ?? 0,
  }));
}

/** Options for the product form's supplier dropdown. */
export async function getSupplierOptions(supabase) {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Ids of the suppliers with these names (case-insensitive). Names that match
 * no supplier are simply absent from the result.
 */
export async function getSupplierIdsByNames(supabase, names) {
  const wanted = new Set(
    [].concat(names ?? []).map((n) => String(n).trim().toLowerCase()).filter(Boolean)
  );
  if (wanted.size === 0) return [];

  // Supplier lists are small, so matching in JS avoids building an `or`
  // filter out of free-text names.
  const { data, error } = await supabase.from("suppliers").select("id, name");
  if (error) throw error;
  return data.filter((s) => wanted.has(s.name.trim().toLowerCase())).map((s) => s.id);
}
