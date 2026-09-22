"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminModules } from "@/lib/data/adminUsers";
import { parseAdminUserForm } from "@/lib/validation/adminUser";

/**
 * Admin user management. Only super admins may call these ("users" is a
 * super-admin-only module — see lib/admin-modules.js), and they can only
 * ever manage *staff* users: super admins (the primary/protected accounts)
 * and the caller's own account can't be edited or deleted here, and staff
 * can't be promoted, so there is no way to escalate permissions.
 *
 * Credentials live only in Supabase Auth; the app never stores passwords.
 */

const PROTECTED_MESSAGE = "Super admin accounts are protected and can't be changed here.";

async function guard() {
  const auth = await requireAdmin("users");
  if (auth.error) return { error: auth.error };
  return { caller: auth.user, admin: createAdminClient() };
}

async function parse(formData, isCreate) {
  let modules;
  try {
    modules = await getAdminModules();
  } catch (err) {
    return { error: err.message };
  }
  return parseAdminUserForm(formData, { isCreate, moduleKeys: modules.map((m) => m.key) });
}

/** Supabase Auth errors that belong next to a specific field. */
function authFieldError(error) {
  const message = error?.message ?? "";
  if (error?.code === "email_exists" || /already (been )?registered|already exists/i.test(message)) {
    return { fieldErrors: { email: "A user with this email address already exists." } };
  }
  if (error?.code === "weak_password" || /password/i.test(message)) {
    return { fieldErrors: { password: message } };
  }
  if (/email/i.test(message)) return { fieldErrors: { email: message } };
  return { error: message || "Supabase Auth rejected the request." };
}

/** Loads the target and refuses protected accounts. */
async function loadManageable(admin, caller, id) {
  const { data: target, error } = await admin
    .from("admin_users")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!target) return { error: "This user no longer exists." };
  if (target.id === caller.id) return { error: "You can't change your own account here — use Settings." };
  if (target.role === "super_admin") return { error: PROTECTED_MESSAGE };
  return { target };
}

/** Makes the user's modules exactly `modules`: add missing, then drop the rest. */
async function setModules(admin, userId, modules) {
  const { error: insertError } = await admin
    .from("admin_user_permissions")
    .upsert(
      modules.map((module_key) => ({ user_id: userId, module_key })),
      { onConflict: "user_id,module_key", ignoreDuplicates: true }
    );
  if (insertError) throw new Error(insertError.message);

  const { error: deleteError } = await admin
    .from("admin_user_permissions")
    .delete()
    .eq("user_id", userId)
    .not("module_key", "in", `(${modules.join(",")})`);
  if (deleteError) throw new Error(deleteError.message);
}

export async function createAdminUser(formData) {
  const { caller, admin, error: guardError } = await guard();
  if (guardError) return { error: guardError };

  const parsed = await parse(formData, true);
  if (parsed.error || parsed.fieldErrors) return parsed;
  const { email, password, full_name, modules } = parsed.data;

  // Pre-confirmed: the admin chose the credentials, so the user can sign in
  // straight away without an email round trip.
  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: full_name ? { full_name } : {},
  });
  if (authError) return authFieldError(authError);

  const userId = created.user.id;
  try {
    const { error } = await admin
      .from("admin_users")
      .insert({ id: userId, full_name, role: "staff", created_by: caller.id });
    if (error) throw new Error(error.message);
    await setModules(admin, userId, modules);
  } catch (err) {
    // Don't leave a login behind that has no (or half-saved) permissions.
    await admin.auth.admin.deleteUser(userId);
    return { error: `Could not save the user's permissions: ${err.message}` };
  }

  revalidatePath("/admin/users");
  return { success: true, email };
}

export async function updateAdminUser(id, formData) {
  const { caller, admin, error: guardError } = await guard();
  if (guardError) return { error: guardError };

  const { error: targetError } = await loadManageable(admin, caller, id);
  if (targetError) return { error: targetError };

  const parsed = await parse(formData, false);
  if (parsed.error || parsed.fieldErrors) return parsed;
  const { email, password, full_name, modules } = parsed.data;

  const authUpdate = { email, email_confirm: true };
  if (password) authUpdate.password = password;
  const { error: authError } = await admin.auth.admin.updateUserById(id, authUpdate);
  if (authError) return authFieldError(authError);

  try {
    const { error } = await admin.from("admin_users").update({ full_name }).eq("id", id);
    if (error) throw new Error(error.message);
    await setModules(admin, id, modules);
  } catch (err) {
    return { error: `Login details were saved, but permissions weren't: ${err.message}` };
  }

  revalidatePath("/admin/users");
  return { success: true, email, passwordChanged: Boolean(password) };
}

/** Deletes the Auth user; admin_users and permissions cascade from it. */
export async function deleteAdminUser(id) {
  const { caller, admin, error: guardError } = await guard();
  if (guardError) return { error: guardError };

  const { error: targetError } = await loadManageable(admin, caller, id);
  if (targetError) return { error: targetError };

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}
