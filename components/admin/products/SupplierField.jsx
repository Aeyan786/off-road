"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Select value meaning "type a new supplier name". */
export const OTHER_SUPPLIER = "__other__";

/**
 * Supplier picker for the product form: existing suppliers, plus "Other…"
 * which reveals a name input. A typed name that matches an existing
 * supplier (ignoring case) is reused on save rather than duplicated.
 *
 * Both controls are controlled so they survive the form's reset after a
 * failed submit.
 */
export default function SupplierField({
  options = [],
  defaultSupplierId = "",
  defaultNewName = "",
  selectClassName,
  error,
}) {
  const [choice, setChoice] = useState(defaultSupplierId);
  const [newName, setNewName] = useState(defaultNewName);
  const isOther = choice === OTHER_SUPPLIER;

  const invalid = error
    ? { "aria-invalid": true, "aria-describedby": "supplier-error" }
    : {};

  return (
    <div className="space-y-2">
      <select
        id="supplier_id"
        name="supplier_id"
        value={choice}
        onChange={(event) => setChoice(event.target.value)}
        className={cn(selectClassName, "cursor-pointer")}
        {...(isOther ? {} : invalid)}
      >
        <option value="">Select a supplier</option>
        {options.map((supplier) => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.name}
          </option>
        ))}
        <option value={OTHER_SUPPLIER}>Other…</option>
      </select>

      {isOther ? (
        <Input
          id="supplier_new"
          name="supplier_new"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New supplier name"
          aria-label="New supplier name"
          autoFocus
          {...invalid}
        />
      ) : null}
    </div>
  );
}
