"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  HEX_COLOR,
  LIMITS,
  TEMPLATE_KEYS,
  THEME_FIELDS,
  unknownPlaceholders,
} from "@/lib/email/template-config";

/**
 * Saves /admin/templates edits. Only the words (subject, heading, body) and
 * the shared colours/header text are editable — the layout stays in code.
 * Writes use the service-role client (the tables are closed to the public
 * key); access is checked with the "email_templates" permission.
 */

function checkText(value, label, max, key) {
  const text = String(value ?? "").replace(/\r\n?/g, "\n").trim();
  if (!text) return { error: `${label} is required.` };
  if (text.length > max) return { error: `${label} must be ${max} characters or fewer.` };
  if (key) {
    const bad = unknownPlaceholders(text, key);
    if (bad.length) {
      return { error: `${label} uses ${bad.map((n) => `{{${n}}}`).join(", ")}, which this email can't fill in.` };
    }
  }
  return { text };
}

export async function saveEmailTemplate({ key, subject, heading, body }) {
  const { user, error: authError } = await requireAdmin("email_templates");
  if (authError) return { error: authError };
  if (!TEMPLATE_KEYS.includes(key)) return { error: "Unknown email template." };

  const fieldErrors = {};
  const values = {};
  for (const [name, label, raw] of [
    ["subject", "Subject", subject],
    ["heading", "Heading", heading],
    ["body", "Body text", body],
  ]) {
    const checked = checkText(raw, label, LIMITS[name], key);
    if (checked.error) fieldErrors[name] = checked.error;
    else values[name] = name === "subject" ? checked.text.replace(/\s+/g, " ") : checked.text;
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const { error } = await createAdminClient()
    .from("email_templates")
    .upsert({ key, ...values, updated_by: user.id }, { onConflict: "key" });
  if (error) return { error: `Couldn't save the template: ${error.message}` };

  revalidatePath("/admin/templates");
  return { success: true };
}

export async function saveEmailTheme(theme) {
  const { user, error: authError } = await requireAdmin("email_templates");
  if (authError) return { error: authError };

  const fieldErrors = {};
  const values = {};

  const title = checkText(theme?.header_title, "Header text", LIMITS.header_title);
  if (title.error) fieldErrors.header_title = title.error;
  else values.header_title = title.text.replace(/\s+/g, " ");

  for (const [field, label] of Object.entries(THEME_FIELDS)) {
    const color = String(theme?.[field] ?? "").trim();
    if (!HEX_COLOR.test(color)) fieldErrors[field] = `${label} must be a colour like #1B9DDB.`;
    else values[field] = color.toUpperCase();
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const { error } = await createAdminClient()
    .from("email_theme")
    .upsert({ id: 1, ...values, updated_by: user.id }, { onConflict: "id" });
  if (error) return { error: `Couldn't save the colours: ${error.message}` };

  revalidatePath("/admin/templates");
  return { success: true };
}
