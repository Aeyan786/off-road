import { z } from "zod";

/**
 * Server-side validation for admin-created users. The password is only
 * passed straight on to Supabase Auth — it is never stored by the app.
 * When editing, a blank password means "keep the current one".
 */

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

function schemaFor({ isCreate, moduleKeys }) {
  return z.object({
    full_name: z
      .string()
      .trim()
      .max(100, "Name must be 100 characters or fewer.")
      .transform((value) => value || null),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address.")),
    password: isCreate
      ? password
      : z.union([z.literal(""), password]).transform((value) => value || null),
    modules: z
      .array(z.enum(moduleKeys, { error: "Unknown module." }))
      .min(1, "Give this user access to at least one module."),
  });
}

/**
 * @param {FormData} formData
 * @param {{isCreate: boolean, moduleKeys: string[]}} options moduleKeys are
 *   the assignable keys from the admin_modules table
 * @returns {{data: object}|{fieldErrors: Record<string, string>}}
 */
export function parseAdminUserForm(formData, options) {
  let modules = [];
  try {
    const parsed = JSON.parse(formData.get("modules") ?? "[]");
    if (Array.isArray(parsed)) modules = [...new Set(parsed)];
  } catch {
    return { fieldErrors: { modules: "Could not read the selected modules." } };
  }

  const result = schemaFor(options).safeParse({
    full_name: formData.get("full_name") ?? "",
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    modules,
  });

  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return {
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]])
      ),
    };
  }

  return { data: result.data };
}
