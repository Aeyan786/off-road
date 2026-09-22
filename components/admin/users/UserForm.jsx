"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminUser, updateAdminUser } from "@/actions/users";
import { cn } from "@/lib/utils";

const initialState = { error: null, fieldErrors: {}, values: null, attempt: 0 };

function Field({ label, htmlFor, error, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error ? <p className="text-xs text-neutral-400">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Create/edit a staff admin user: login details (kept in Supabase Auth) and
 * the modules they may open. Shared by the Create and Edit pages.
 *
 * @param {object} [user] existing staff user (edit mode)
 * @param {{key: string, label: string}[]} modules assignable modules
 */
export default function UserForm({ user, modules }) {
  const router = useRouter();
  const isEdit = Boolean(user?.id);
  const [selected, setSelected] = useState(() => new Set(user?.modules ?? []));

  const [state, formAction, isPending] = useActionState(async (prev, formData) => {
    const result = isEdit
      ? await updateAdminUser(user.id, formData)
      : await createAdminUser(formData);

    if (result?.success) {
      toast.success(
        isEdit
          ? `Saved ${result.email}${result.passwordChanged ? " — password changed" : ""}.`
          : `${result.email} can now sign in.`
      );
      router.push("/admin/users");
      return initialState;
    }

    if (result?.error) toast.error(result.error);
    return {
      error: result?.error ?? null,
      fieldErrors: result?.fieldErrors ?? {},
      // Never echo the password back into the form.
      values: { full_name: formData.get("full_name"), email: formData.get("email") },
      attempt: (prev?.attempt ?? 0) + 1,
    };
  }, initialState);

  const fieldErrors = state?.fieldErrors ?? {};
  const value = (name, fallback) => state?.values?.[name] ?? fallback ?? "";
  const invalid = (name) =>
    fieldErrors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};

  const allSelected = modules.length > 0 && modules.every((m) => selected.has(m.key));

  function toggle(key, checked) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="modules" value={JSON.stringify([...selected])} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Login details</CardTitle>
          </CardHeader>
          {/* Re-keyed after a failed save: Base UI inputs can't change their
              defaultValue once mounted. */}
          <CardContent key={state?.attempt ?? 0} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name (optional)" htmlFor="full_name" error={fieldErrors.full_name} className="sm:col-span-2">
              <Input
                id="full_name"
                name="full_name"
                autoComplete="off"
                defaultValue={value("full_name", user?.fullName)}
                {...invalid("full_name")}
              />
            </Field>

            <Field label="Email" htmlFor="email" error={fieldErrors.email} hint="They sign in with this address.">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="off"
                defaultValue={value("email", user?.email)}
                {...invalid("email")}
              />
            </Field>

            <Field
              label={isEdit ? "New password" : "Password"}
              htmlFor="password"
              error={fieldErrors.password}
              hint={isEdit ? "Leave blank to keep their current password." : "At least 8 characters. Share it with them securely."}
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                {...invalid("password")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Access</CardTitle>
            <button
              type="button"
              onClick={() => setSelected(allSelected ? new Set() : new Set(modules.map((m) => m.key)))}
              className="cursor-pointer text-xs font-medium text-brand hover:underline"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </CardHeader>
          <CardContent className="space-y-1">
            {modules.map((module) => (
              <label
                key={module.key}
                className="flex cursor-pointer items-center gap-2.5 rounded-sm px-1 py-1.5 hover:bg-neutral-50"
              >
                <Checkbox
                  checked={selected.has(module.key)}
                  onCheckedChange={(checked) => toggle(module.key, checked)}
                  className="cursor-pointer"
                />
                <span className="text-sm text-neutral-800">{module.label}</span>
              </label>
            ))}
            <p className="pt-2 text-xs text-neutral-400">
              Every user can manage their own account in Settings. Only super
              admins can manage users.
            </p>
            {fieldErrors.modules ? (
              <p id="modules-error" role="alert" className="text-xs text-destructive">
                {fieldErrors.modules}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" className="cursor-pointer rounded-sm px-3 text-xs" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {isEdit ? "Save Changes" : "Create User"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer rounded-sm px-3 text-xs"
          onClick={() => router.push("/admin/users")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
