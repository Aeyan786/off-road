/** Escapes LIKE wildcards so a name is matched literally by ilike(). */
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Trims and collapses inner whitespace, e.g. "  FMF   Racing " -> "FMF Racing". */
export function normalizeSupplierName(name) {
  return (name ?? "").toString().replace(/\s+/g, " ").trim();
}

/**
 * Returns the id of the supplier called `name` (case-insensitive), creating
 * it if it doesn't exist yet — so typing "fmf racing" reuses "FMF Racing"
 * instead of making a duplicate. The unique index on lower(btrim(name))
 * (0007_suppliers_admin_users.sql) backs this up if two requests race.
 *
 * @param {Map<string, string>} [cache] lower-cased name -> id, for bulk use
 * @returns {Promise<{id: string, created: boolean}|null>} null for a blank name
 * @throws if a query fails
 */
export async function resolveSupplierId(supabase, name, cache) {
  const clean = normalizeSupplierName(name);
  if (!clean) return null;

  const key = clean.toLowerCase();
  if (cache?.has(key)) return { id: cache.get(key), created: false };

  const find = async () => {
    const { data, error } = await supabase
      .from("suppliers")
      .select("id")
      .ilike("name", escapeLike(clean))
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.id ?? null;
  };

  let id = await find();
  let created = false;

  if (!id) {
    const { data, error } = await supabase
      .from("suppliers")
      .insert({ name: clean })
      .select("id")
      .single();

    if (error?.code === "23505") {
      id = await find(); // created by a concurrent request
    } else if (error) {
      throw new Error(error.message);
    } else {
      id = data.id;
      created = true;
    }
  }

  cache?.set(key, id);
  return { id, created };
}
