/**
 * Wraps a Supabase read for public-facing pages so a not-yet-migrated
 * database (or a transient query error) degrades to an empty result
 * instead of crashing the page. Logs server-side so real issues are still
 * visible.
 */
export async function safeQuery(promise, fallback) {
  try {
    return await promise;
  } catch (error) {
    console.error("[safeQuery] falling back:", error.message);
    return fallback;
  }
}
