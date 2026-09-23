import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_TEMPLATES, DEFAULT_THEME, TEMPLATE_KEYS } from "@/lib/email/template-config";

/**
 * Admin-edited email text and colours (0011_email_templates.sql), read with
 * the service-role client (the tables are closed to the public key).
 *
 * @returns {Promise<{templates: Record<string, {subject, heading, body, updated_at?}>, theme: object}>}
 * @throws if the tables can't be read
 */
export async function getEmailSettings() {
  const admin = createAdminClient();
  const [templatesResult, themeResult] = await Promise.all([
    admin.from("email_templates").select("key, subject, heading, body, updated_at"),
    admin.from("email_theme").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (templatesResult.error) throw new Error(templatesResult.error.message);
  if (themeResult.error) throw new Error(themeResult.error.message);

  const byKey = Object.fromEntries(templatesResult.data.map((row) => [row.key, row]));
  const templates = Object.fromEntries(
    TEMPLATE_KEYS.map((key) => [key, { ...DEFAULT_TEMPLATES[key], ...(byKey[key] ?? {}) }])
  );

  const theme = { ...DEFAULT_THEME };
  for (const field of Object.keys(DEFAULT_THEME)) {
    if (themeResult.data?.[field]) theme[field] = themeResult.data[field];
  }

  return { templates, theme };
}

/**
 * For sending: never blocks an email. If the settings can't be read, the
 * built-in defaults are used and the problem is logged.
 */
export async function getEmailSettingsOrDefaults() {
  try {
    return await getEmailSettings();
  } catch (err) {
    console.error("[email templates] using defaults:", err.message);
    return { templates: { ...DEFAULT_TEMPLATES }, theme: { ...DEFAULT_THEME } };
  }
}
