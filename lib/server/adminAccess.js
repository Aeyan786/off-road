import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Loads what a signed-in Auth user may do in the admin portal, from
 * admin_users + admin_user_permissions. Read with the service-role client so
 * it keeps working even if those tables are later hidden from the public
 * API key.
 *
 * @returns {Promise<{role: string, fullName: string|null, isSuperAdmin: boolean, modules: string[]}|null>}
 *   null when the user has no admin access at all
 * @throws if the query fails
 */
export async function loadAdminAccess(userId) {
  if (!userId) return null;

  const { data, error } = await createAdminClient()
    .from("admin_users")
    .select("role, full_name, admin_user_permissions ( module_key )")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    role: data.role,
    fullName: data.full_name,
    isSuperAdmin: data.role === "super_admin",
    modules: (data.admin_user_permissions ?? []).map((p) => p.module_key),
  };
}

/** Per-request memoised version for Server Components and actions. */
export const getAdminAccess = cache(loadAdminAccess);
