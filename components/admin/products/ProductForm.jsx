"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductImagesField from "@/components/admin/products/ProductImagesField";
import { createProduct, updateProduct } from "@/actions/products";
import { cn } from "@/lib/utils";

const initialState = {
  error: null,
  fieldErrors: {},
  values: null,
};

const INPUT_CLASS =
  "flex w-full rounded-lg border border-neutral-300 bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Field({ label, htmlFor, error, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>

      {children}

      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function ProductForm({ product, categoryOptions }) {
  const router = useRouter();
  const isEdit = Boolean(product?.id);

  const [images, setImages] = useState(product?.images ?? []);

  const [state, formAction, isPending] = useActionState(
    async (_prev, formData) => {
      const result = isEdit
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result?.success) {
        router.push("/admin/products");
        return initialState;
      }

      return {
        error: result?.error ?? null,
        fieldErrors: result?.fieldErrors ?? {},
        values: Object.fromEntries(formData.entries()),
      };
    },
    initialState,
  );

  const fieldErrors = state?.fieldErrors ?? {};
  const values = state?.values;

  const getValue = (name, fallback = "") => {
    if (values && values[name] !== undefined) {
      return values[name];
    }

    return fallback;
  };

  const getChecked = (name, fallback = false) => {
    if (values && values[name] !== undefined) {
      return values[name] === "on";
    }

    return fallback;
  };

  const getSubmittedImages = () => {
    if (!values?.images) {
      return product?.images ?? [];
    }

    try {
      const parsed = JSON.parse(values.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return product?.images ?? [];
    }
  };

  const errorProps = (name) =>
    fieldErrors[name]
      ? {
          "aria-invalid": true,
          "aria-describedby": `${name}-error`,
        }
      : {};

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="images"
        value={JSON.stringify(
          values?.images ? getSubmittedImages() : images
        )}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Product Name"
                htmlFor="product"
                error={fieldErrors.product}
                className="sm:col-span-2"
              >
                <Input
                  id="product"
                  name="product"
                  defaultValue={getValue(
                    "product",
                    product?.product ?? ""
                  )}
                  {...errorProps("product")}
                />
              </Field>

              <Field label="SKU" htmlFor="sku" error={fieldErrors.sku}>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={getValue("sku", product?.sku ?? "")}
                  {...errorProps("sku")}
                />
              </Field>

              <Field
                label="Category"
                htmlFor="categories"
                error={fieldErrors.categories}
              >
                <select
                  id="categories"
                  name="categories"
                  defaultValue={getValue(
                    "categories",
                    product?.categories?.id ?? ""
                  )}
                  className={cn(INPUT_CLASS, "h-9 py-0")}
                  {...errorProps("categories")}
                >
                  <option value="">Select a category</option>

                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.path}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Supplier"
                htmlFor="supplier"
                error={fieldErrors.supplier}
              >
                <Input
                  id="supplier"
                  name="supplier"
                  defaultValue={getValue(
                    "supplier",
                    product?.supplier ?? ""
                  )}
                  {...errorProps("supplier")}
                />
              </Field>

              <Field
                label="Manufacturer"
                htmlFor="manufacturer"
                error={fieldErrors.manufacturer}
              >
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  defaultValue={getValue(
                    "manufacturer",
                    product?.manufacturer ?? ""
                  )}
                  {...errorProps("manufacturer")}
                />
              </Field>

              <Field
                label="Model"
                htmlFor="model"
                error={fieldErrors.model}
              >
                <Input
                  id="model"
                  name="model"
                  defaultValue={getValue("model", product?.model ?? "")}
                  {...errorProps("model")}
                />
              </Field>

              <Field
                label="Year"
                htmlFor="year"
                error={fieldErrors.year}
              >
                <Input
                  id="year"
                  name="year"
                  defaultValue={getValue("year", product?.year ?? "")}
                  {...errorProps("year")}
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field
                label="Short Description"
                htmlFor="small_description"
                error={fieldErrors.small_description}
              >
                <textarea
                  id="small_description"
                  name="small_description"
                  defaultValue={getValue(
                    "small_description",
                    product?.small_description ?? ""
                  )}
                  rows={3}
                  className={`${INPUT_CLASS} resize-none overflow-hidden`}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  {...errorProps("small_description")}
                />
              </Field>

              <Field
                label="Description (optional)"
                htmlFor="description"
                error={fieldErrors.description}
              >
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  defaultValue={getValue(
                    "description",
                    product?.description ?? ""
                  )}
                  className={`${INPUT_CLASS} resize-none overflow-hidden`}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  {...errorProps("description")}
                />
              </Field>

              <Field
                label="Additional Information (optional)"
                htmlFor="additional_information"
                error={fieldErrors.additional_information}
              >
                <textarea
                  id="additional_information"
                  name="additional_information"
                  rows={3}
                  defaultValue={getValue(
                    "additional_information",
                    product?.additional_information ?? ""
                  )}
                  className={`${INPUT_CLASS} resize-none overflow-hidden`}
                  onInput={(e) => {
                    e.currentTarget.style.height = "auto";
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                  }}
                  {...errorProps("additional_information")}
                />
              </Field>
            </CardContent>
          </Card>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Dimensions</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field
                label="Width"
                htmlFor="width"
                error={fieldErrors.width}
              >
                <Input
                  id="width"
                  name="width"
                  type="number"
                  step="any"
                  defaultValue={getValue("width", product?.width ?? "")}
                  {...errorProps("width")}
                />
              </Field>

              <Field
                label="Length"
                htmlFor="length"
                error={fieldErrors.length}
              >
                <Input
                  id="length"
                  name="length"
                  type="number"
                  step="any"
                  defaultValue={getValue(
                    "length",
                    product?.length ?? ""
                  )}
                  {...errorProps("length")}
                />
              </Field>

              <Field
                label="Height"
                htmlFor="height"
                error={fieldErrors.height}
              >
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="any"
                  defaultValue={getValue(
                    "height",
                    product?.height ?? ""
                  )}
                  {...errorProps("height")}
                />
              </Field>

              <Field
                label="Weight (g)"
                htmlFor="weight_grams"
                error={fieldErrors.weight_grams}
              >
                <Input
                  id="weight_grams"
                  name="weight_grams"
                  type="number"
                  step="any"
                  defaultValue={getValue(
                    "weight_grams",
                    product?.weight_grams ?? ""
                  )}
                  {...errorProps("weight_grams")}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">
                Pricing &amp; Stock
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Field
                label="Price"
                htmlFor="price"
                error={fieldErrors.price}
              >
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={getValue("price", product?.price ?? "")}
                  {...errorProps("price")}
                />
              </Field>

              <Field
                label="Discount Price (optional)"
                htmlFor="discount_price"
                error={fieldErrors.discount_price}
              >
                <Input
                  id="discount_price"
                  name="discount_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={getValue(
                    "discount_price",
                    product?.discount_price ?? ""
                  )}
                  {...errorProps("discount_price")}
                />
              </Field>

              <Field
                label="Quantity"
                htmlFor="quantity"
                error={fieldErrors.quantity}
              >
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue={getValue(
                    "quantity",
                    product?.quantity ?? ""
                  )}
                  {...errorProps("quantity")}
                />
              </Field>

              <Field
                label="Status"
                htmlFor="status"
                error={fieldErrors.status}
              >
                <select
                  id="status"
                  name="status"
                  defaultValue={getValue(
                    "status",
                    product?.status ?? "active"
                  )}
                  className={cn(
                    INPUT_CLASS,
                    "h-9 cursor-pointer py-0"
                  )}
                  {...errorProps("status")}
                >
                  <option value="active">
                    Active — visible on the website
                  </option>

                  <option value="draft">
                    Draft — hidden from the website
                  </option>
                </select>
              </Field>

              <label className="flex cursor-pointer items-center gap-2.5 pt-1">
                <Checkbox
                  id="new_arrival"
                  name="new_arrival"
                  defaultChecked={getChecked(
                    "new_arrival",
                    product?.new_arrival ?? false
                  )}
                  className="cursor-pointer"
                />

                <span className="text-sm text-neutral-800">
                  Set as New Arrival
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Images</CardTitle>
            </CardHeader>

            <CardContent>
              <ProductImagesField
                value={values?.images ? getSubmittedImages() : images}
                onChange={setImages}
                error={fieldErrors.images}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          className="cursor-pointer rounded-sm px-3 text-xs"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}

          {isEdit ? "Save Changes" : "Create Product"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="cursor-pointer rounded-sm px-3 text-xs"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}