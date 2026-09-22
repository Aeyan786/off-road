"use client";

import { useActionState } from "react";
import { Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { changeEmail, changePassword } from "@/actions/account";

const initialState = { error: null, fieldErrors: {}, attempt: 0, notice: null };

function Field({ label, name, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? (
        <p id={`${name}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const invalid = (errors, name) =>
  errors?.[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};

function EmailForm({ currentEmail, pendingEmail }) {
  const [state, formAction, isPending] = useActionState(async (prev, formData) => {
    const result = await changeEmail(formData);
    const attempt = (prev?.attempt ?? 0) + 1;
    if (result?.success) {
      const notice = result.applied
        ? `Your email is now ${result.email}.`
        : `Check ${result.email} for a confirmation link. Your email changes once you click it. If "Secure email change" is on in Supabase, confirm from your current address too.`;
      toast.success(result.applied ? "Email updated." : "Confirmation email sent.");
      return { ...initialState, attempt, notice };
    }
    if (result?.error) toast.error(result.error);
    return { error: result?.error ?? null, fieldErrors: result?.fieldErrors ?? {}, attempt, notice: null };
  }, initialState);

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="size-4 text-brand" />
          Email address
        </CardTitle>
        <CardDescription>
          You sign in with <span className="font-medium text-neutral-800">{currentEmail}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {pendingEmail ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              A change to <span className="font-medium">{pendingEmail}</span> is waiting for
              confirmation. Submitting again sends a new link.
            </p>
          ) : null}
          <Field label="New email" name="email" error={state?.fieldErrors?.email}>
            <Input key={state?.attempt} id="email" name="email" type="email" autoComplete="email" required {...invalid(state?.fieldErrors, "email")} />
          </Field>
          {state?.notice ? (
            <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {state.notice}
            </p>
          ) : null}
          {state?.error ? (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" className="cursor-pointer rounded-sm px-3 text-xs" disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Change email
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [state, formAction, isPending] = useActionState(async (prev, formData) => {
    const result = await changePassword(formData);
    const attempt = (prev?.attempt ?? 0) + 1;
    if (result?.success) {
      toast.success("Password changed.");
      return { ...initialState, attempt, notice: "Your password has been changed. Use it next time you sign in." };
    }
    if (result?.error) toast.error(result.error);
    return { error: result?.error ?? null, fieldErrors: result?.fieldErrors ?? {}, attempt, notice: null };
  }, initialState);

  const errors = state?.fieldErrors ?? {};

  return (
    <Card className="rounded-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="size-4 text-brand" />
          Password
        </CardTitle>
        <CardDescription>Use at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Re-keyed each submit so the password fields always clear. */}
        <form key={state?.attempt} action={formAction} className="space-y-4">
          <Field label="Current password" name="current_password" error={errors.current_password}>
            <Input id="current_password" name="current_password" type="password" autoComplete="current-password" required {...invalid(errors, "current_password")} />
          </Field>
          <Field label="New password" name="new_password" error={errors.new_password}>
            <Input id="new_password" name="new_password" type="password" autoComplete="new-password" required {...invalid(errors, "new_password")} />
          </Field>
          <Field label="Confirm new password" name="confirm_password" error={errors.confirm_password}>
            <Input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required {...invalid(errors, "confirm_password")} />
          </Field>
          {state?.notice ? (
            <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {state.notice}
            </p>
          ) : null}
          {state?.error ? (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" className="cursor-pointer rounded-sm px-3 text-xs" disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AccountForms({ currentEmail, pendingEmail }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <EmailForm currentEmail={currentEmail} pendingEmail={pendingEmail} />
      <PasswordForm />
    </div>
  );
}
