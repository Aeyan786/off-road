import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin users combine two sources: Supabase Auth (email, last sign-in —
 * credentials never leave Auth) and admin_users/admin_user_permissions
 * (role and modules). Server-only: reads go through the service-role client.
 */

function toAdminUser(authUser, row) {
  return {
    id: row.id,
    email: authUser?.email ?? null,
    fullName: row.full_name,
    role: row.role,
    isSuperAdmin: row.role === "super_admin",
    modules: (row.admin_user_permissions ?? []).map((p) => p.module_key),
    lastSignInAt: authUser?.last_sign_in_at ?? null,
    createdAt: row.created_at,
  };
}

/** Assignable modules, in sidebar order. */
export async function getAdminModules() {
  const { data, error } = await createAdminClient()
    .from("admin_modules")
    .select("key, label")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

/** Every admin user, super admins first, then by name/email. */
export async function listAdminUsers() {
  const admin = createAdminClient();

  const [{ data: rows, error }, { data: authData, error: authError }] = await Promise.all([
    admin
      .from("admin_users")
      .select("id, full_name, role, created_at, admin_user_permissions ( module_key )"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (error) throw new Error(error.message);
  if (authError) throw new Error(authError.message);

  const authById = new Map(authData.users.map((u) => [u.id, u]));

  return rows
    .map((row) => toAdminUser(authById.get(row.id), row))
    .sort(
      (a, b) =>
        Number(b.isSuperAdmin) - Number(a.isSuperAdmin) ||
        (a.fullName || a.email || "").localeCompare(b.fullName || b.email || "")
    );
}

/** One admin user, or null if the id isn't an admin user. */
export async function getAdminUser(id) {
  const admin = createAdminClient();

  const { data: row, error } = await admin
    .from("admin_users")
    .select("id, full_name, role, created_at, admin_user_permissions ( module_key )")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    // A malformed id is simply "not found".
    if (error.code === "22P02") return null;
    throw new Error(error.message);
  }
  if (!row) return null;

  const { data: authData } = await admin.auth.admin.getUserById(id);
  return toAdminUser(authData?.user, row);
}
