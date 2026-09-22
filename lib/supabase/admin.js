import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the service-role key: bypasses RLS/grants and can
 * call the Auth admin API (create/update/delete users). Server-only — the
 * key has no NEXT_PUBLIC_ prefix so Next never ships it to the browser, and
 * this guard fails loudly if it's ever imported client-side by mistake.
 *
 * Use it only for what the user's own session can't do: admin user
 * management and reading admin permissions.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must only be used on the server.");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set (see .env.local).");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
