import { createClient } from "@/lib/supabase/server";

/**
 * Server Functions are reachable by direct POST, not just through the admin
 * UI, so every mutating action verifies the session itself rather than
 * relying on proxy.js alone.
 *
 * This project has no role column — an authenticated Supabase user *is* an
 * admin (same rule proxy.js enforces for /admin and /api/admin).
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, user: null, error: "Not authorized." };
  }

  return { supabase, user, error: null };
}
