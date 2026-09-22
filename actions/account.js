"use server";

import { headers } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/requireAdmin";

/**
 * The signed-in user's own account (Settings). Everything goes through
 * Supabase Auth with the user's own session — no admin/service key and no
 * password storage in our tables.
 */

const emailSchema = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

/** Absolute URL of this site, for links in Supabase emails. */
async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Checks a password without touching the user's real session: a throwaway
 * client signs in, then signs that one-off session straight back out.
 */
async function isCurrentPassword(email, password) {
  const probe = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error } = await probe.auth.signInWithPassword({ email, password });
  if (error) return false;
  await probe.auth.signOut({ scope: "local" });
  return true;
}

/**
 * Starts an email change. Supabase emails a confirmation link (to the new
 * address, and to the current one too when "Secure email change" is on);
 * the email only changes once the link(s) are clicked.
 */
export async function changeEmail(formData) {
  const { supabase, user, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const parsed = emailSchema.safeParse(formData.get("email") ?? "");
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message } };
  const email = parsed.data;

  if (email === user.email?.toLowerCase()) {
    return { fieldErrors: { email: "That's already your email address." } };
  }

  const { data, error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${await siteOrigin()}/admin/settings` }
  );
  if (error) return { error: error.message };

  // With email confirmation off in Supabase, the change applies at once.
  const applied = data.user?.email?.toLowerCase() === email;
  return { success: true, email, applied };
}

export async function changePassword(formData) {
  const { supabase, user, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  const fieldErrors = {};
  if (!current) fieldErrors.current_password = "Enter your current password.";
  const parsedNext = passwordSchema.safeParse(next);
  if (!parsedNext.success) fieldErrors.new_password = parsedNext.error.issues[0].message;
  else if (next === current) fieldErrors.new_password = "Choose a password different from your current one.";
  if (!fieldErrors.new_password && confirm !== next) fieldErrors.confirm_password = "Passwords don't match.";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  if (!(await isCurrentPassword(user.email, current))) {
    return { fieldErrors: { current_password: "Your current password is incorrect." } };
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { error: error.message };

  return { success: true };
}
