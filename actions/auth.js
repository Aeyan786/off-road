"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadAdminAccess } from "@/lib/server/adminAccess";
import { firstAllowedPath } from "@/lib/admin-modules";

/**
 * Signs a user in with email/password. Only accounts with an admin_users row
 * may use the portal; anyone else is signed straight back out. Admins land
 * on the first page their permissions allow (the dashboard for most).
 * Returns a plain { error } object on failure so the client form can show it
 * without a full page transition.
 */
export async function login(formData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  let access;
  try {
    access = await loadAdminAccess(data.user.id);
  } catch (err) {
    await supabase.auth.signOut();
    return { error: `Could not check your access: ${err.message}` };
  }

  if (!access) {
    await supabase.auth.signOut();
    return { error: NO_ACCESS_MESSAGE };
  }

  redirect(firstAllowedPath(access));
}

const NO_ACCESS_MESSAGE = "This account doesn't have access to the admin portal.";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
