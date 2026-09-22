"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { startCheckout } from "@/actions/checkout";
import { parseCheckoutForm } from "@/lib/validation/checkout";
import { DEFAULT_COUNTRY_CODE } from "@/lib/shipping-countries";
import { cn } from "@/lib/utils";

const SELECT_CLASS =
  "flex h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

function Field({ label, name, error, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
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
  errors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {};

function AddressFields({ prefix, countries, country, onCountryChange, errors }) {
  const selected = countries.find((c) => c.code === country) ?? countries[0];
  const name = (field) => `${prefix}_${field}`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Address line" name={name("line1")} error={errors[name("line1")]} className="sm:col-span-2">
        <Input id={name("line1")} name={name("line1")} autoComplete={`${prefix} address-line1`} {...invalid(errors, name("line1"))} />
      </Field>
      <Field label="City" name={name("city")} error={errors[name("city")]}>
        <Input id={name("city")} name={name("city")} autoComplete={`${prefix} address-level2`} {...invalid(errors, name("city"))} />
      </Field>
      <Field label={selected.regionLabel} name={name("county")} error={errors[name("county")]}>
        <Input id={name("county")} name={name("county")} autoComplete={`${prefix} address-level1`} {...invalid(errors, name("county"))} />
      </Field>
      <Field label="Postcode" name={name("postcode")} error={errors[name("postcode")]}>
        <Input
          id={name("postcode")}
          name={name("postcode")}
          autoComplete={`${prefix} postal-code`}
          className="uppercase"
          {...invalid(errors, name("postcode"))}
        />
      </Field>
      <Field label="Country" name={name("country")} error={errors[name("country")]}>
        <select
          id={name("country")}
          name={name("country")}
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          autoComplete={`${prefix} country`}
          className={SELECT_CLASS}
          {...invalid(errors, name("country"))}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

/**
 * Customer + address details for checkout. Validates in the browser with
 * the same rules the server uses (lib/validation/checkout.js), then calls
 * startCheckout, which re-validates, prices the cart server-side and
 * redirects to Stripe. Submitting via a transition (not a form action) keeps
 * what the customer typed if the server reports a problem.
 */
export default function CheckoutForm({ countries, disabled = false }) {
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [problems, setProblems] = useState([]);
  const [billingSame, setBillingSame] = useState(true);
  const [shippingCountry, setShippingCountry] = useState(DEFAULT_COUNTRY_CODE);
  const [billingCountry, setBillingCountry] = useState(DEFAULT_COUNTRY_CODE);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setServerError(null);
    setProblems([]);

    const checked = parseCheckoutForm(formData);
    if (checked.fieldErrors) {
      setErrors(checked.fieldErrors);
      // Bring the first problem into view.
      const first = Object.keys(checked.fieldErrors)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await startCheckout(null, formData);
      // On success the action redirects to Stripe and nothing returns.
      if (result?.fieldErrors) setErrors(result.fieldErrors);
      if (result?.error) setServerError(result.error);
      if (result?.problems) setProblems(result.problems);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Contact details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" name="full_name" error={errors.full_name} className="sm:col-span-2">
            <Input id="full_name" name="full_name" autoComplete="name" {...invalid(errors, "full_name")} />
          </Field>
          <Field label="Email" name="email" error={errors.email}>
            <Input id="email" name="email" type="email" autoComplete="email" {...invalid(errors, "email")} />
          </Field>
          <Field label="Phone number" name="phone" error={errors.phone}>
            {/* type="tel", not "number": no scroll-wheel/arrow-key changes and leading + / 0 are kept. */}
            <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" {...invalid(errors, "phone")} />
          </Field>
        </div>
        <p className="text-xs text-neutral-500">
          We&apos;ll email your order confirmation and tracking details to this address.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Shipping address</h2>
        <AddressFields
          prefix="shipping"
          countries={countries}
          country={shippingCountry}
          onCountryChange={setShippingCountry}
          errors={errors}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Billing address</h2>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-800">
          <Checkbox
            name="billing_same"
            checked={billingSame}
            onCheckedChange={(checked) => setBillingSame(Boolean(checked))}
            className="cursor-pointer"
          />
          Billing address same as shipping address
        </label>
        {billingSame ? null : (
          <AddressFields
            prefix="billing"
            countries={countries}
            country={billingCountry}
            onCountryChange={setBillingCountry}
            errors={errors}
          />
        )}
      </section>

      {serverError ? (
        <div role="alert" className="space-y-1 rounded-sm bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">{serverError}</p>
          {problems.length > 0 ? (
            <ul className="list-disc pl-5">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={disabled || isPending}
        className="w-full cursor-pointer rounded-sm px-6 sm:w-auto"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {isPending ? "Redirecting to payment…" : "Proceed to Pay"}
      </Button>
    </form>
  );
}
