const MEDIA_COLUMNS = "id, file_name, storage_path, file_url, file_type, file_size, created_at";

/**
 * @param {object} [filters]
 * @param {string} [filters.search] matches file name
 * @param {number} [filters.limit]
 */
export async function getMedia(supabase, filters = {}) {
  let query = supabase
    .from("media")
    .select(MEDIA_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, "");
    query = query.ilike("file_name", `%${term}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getMediaById(supabase, id) {
  const { data, error } = await supabase
    .from("media")
    .select(MEDIA_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Resolves bare file names (e.g. "xyz.png", or "images/xyz.png") to media
 * rows, matched case-insensitively on file_name. Used by the spreadsheet
 * importer, where the images column holds file names rather than URLs.
 *
 * Returns a Map keyed by the lower-cased base file name.
 */
export async function getMediaByFileNames(supabase, fileNames) {
  const names = [...new Set(fileNames.map(toBaseName).filter(Boolean))];
  if (names.length === 0) return new Map();

  const { data, error } = await supabase
    .from("media")
    .select("file_name, file_url, created_at")
    .in("file_name", names)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Case-insensitive fallback: `in` is case-sensitive, so anything that
  // didn't match exactly is retried against a lower-cased index.
  const byName = new Map();
  for (const row of data) {
    byName.set(row.file_name.toLowerCase(), row.file_url);
  }

  const unmatched = names.filter((n) => !byName.has(n.toLowerCase()));
  if (unmatched.length > 0) {
    // PostgREST splits `or` on commas, so each value is double-quoted (and
    // any embedded quote escaped) to survive file names containing commas.
    const { data: fuzzy, error: fuzzyError } = await supabase
      .from("media")
      .select("file_name, file_url, created_at")
      .or(
        unmatched
          .map((n) => `file_name.ilike."${n.replace(/"/g, '\\"')}"`)
          .join(",")
      )
      .order("created_at", { ascending: true });

    if (fuzzyError) throw fuzzyError;
    for (const row of fuzzy) {
      byName.set(row.file_name.toLowerCase(), row.file_url);
    }
  }

  return byName;
}

/** "images/xyz.png" -> "xyz.png" */
export function toBaseName(value) {
  return value?.toString().trim().split(/[\\/]/).pop() ?? "";
}
