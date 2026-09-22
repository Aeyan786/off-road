import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/server/adminAccess";
import { canAccessAny } from "@/lib/admin-modules";

/**
 * Server Functions are reachable by direct POST, not just through the admin
 * UI, so every mutating action verifies the caller itself rather than
 * relying on proxy.js alone.
 *
 * A caller must be signed in AND have an admin_users row; when `modules` is
 * given they must also be allowed at least one of those modules (super
 * admins always are). See lib/admin-modules.js.
 *
 * @param {string|string[]} [modules] module key(s) the action belongs to
 */
export async function requireAdmin(modules) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, user: null, access: null, error: "Not authorized." };
  }

  let access;
  try {
    access = await getAdminAccess(user.id);
  } catch (err) {
    return { supabase: null, user: null, access: null, error: `Could not check permissions: ${err.message}` };
  }

  if (!access) {
    return { supabase: null, user: null, access: null, error: "Not authorized." };
  }

  if (modules && !canAccessAny(access, modules)) {
    return {
      supabase: null,
      user: null,
      access: null,
      error: "You don't have permission to do this.",
    };
  }

  return { supabase, user, access, error: null };
}
