"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProduct, updateProduct } from "@/actions/products";

const initialState = { error: null };

function Field({ label, htmlFor, children, className }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export default function ProductForm({ product, categoryOptions }) {
  const router = useRouter();
  const isEdit = Boolean(product?.id);
  const fileInputRef = useRef(null);
  const [images, setImages] = useState(product?.images ?? []);
  const [pendingFileNames, setPendingFileNames] = useState([]);

  const [state, formAction, isPending] = useActionState(async (_prev, formData) => {
    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result?.success) {
      router.push("/admin/products");
      return initialState;
    }
    return result ?? initialState;
  }, initialState);

  function removeExistingImage(url) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="existingImages" value={JSON.stringify(images)} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Product Name" htmlFor="product" className="sm:col-span-2">
                <Input
                  id="product"
                  name="product"
                  defaultValue={product?.product ?? ""}
                  required
                />
              </Field>
              <Field label="SKU" htmlFor="sku">
                <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} required />
              </Field>
              <Field label="Category" htmlFor="categories">
                <select
                  id="categories"
                  name="categories"
                  defaultValue={product?.categories?.id ?? ""}
                  className="flex h-8 w-full rounded-lg border border-neutral-300 bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">No category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.path}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Supplier" htmlFor="supplier">
                <Input id="supplier" name="supplier" defaultValue={product?.supplier ?? ""} />
              </Field>
              <Field label="Manufacturer" htmlFor="manufacturer">
                <Input
                  id="manufacturer"
                  name="manufacturer"
                  defaultValue={product?.manufacturer ?? ""}
                />
              </Field>
              <Field label="Model" htmlFor="model">
                <Input id="model" name="model" defaultValue={product?.model ?? ""} />
              </Field>
              <Field label="Year" htmlFor="year">
                <Input id="year" name="year" defaultValue={product?.year ?? ""} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Short Description" htmlFor="small_description">
                <Input
                  id="small_description"
                  name="small_description"
                  defaultValue={product?.small_description ?? ""}
                />
              </Field>
              <Field label="Description" htmlFor="description">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={product?.description ?? ""}
                  className="flex w-full rounded-lg border border-neutral-300 bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <Field label="Additional Information" htmlFor="additional_information">
                <textarea
                  id="additional_information"
                  name="additional_information"
                  rows={3}
                  defaultValue={product?.additional_information ?? ""}
                  className="flex w-full rounded-lg border border-neutral-300 bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Width" htmlFor="width">
                <Input id="width" name="width" type="number" step="any" defaultValue={product?.width ?? ""} />
              </Field>
              <Field label="Length" htmlFor="length">
                <Input id="length" name="length" type="number" step="any" defaultValue={product?.length ?? ""} />
              </Field>
              <Field label="Height" htmlFor="height">
                <Input id="height" name="height" type="number" step="any" defaultValue={product?.height ?? ""} />
              </Field>
              <Field label="Weight (g)" htmlFor="weight_grams">
                <Input
                  id="weight_grams"
                  name="weight_grams"
                  type="number"
                  step="any"
                  defaultValue={product?.weight_grams ?? ""}
                />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing &amp; Stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Price" htmlFor="price">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={product?.price ?? ""}
                  required
                />
              </Field>
              <Field label="Quantity" htmlFor="quantity">
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue={product?.quantity ?? 0}
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url) => (
                    <div key={url} className="group relative aspect-square overflow-hidden rounded-md border bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        aria-label="Remove image"
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 py-6 text-neutral-400 hover:border-neutral-400"
              >
                <ImageIcon className="size-5" />
                <span className="text-xs font-medium">
                  <Upload className="mr-1 inline size-3" />
                  Add images
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="imageFiles"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) =>
                  setPendingFileNames(Array.from(e.target.files ?? []).map((f) => f.name))
                }
              />
              {pendingFileNames.length > 0 ? (
                <ul className="space-y-1 text-xs text-neutral-500">
                  {pendingFileNames.map((name) => (
                    <li key={name} className="truncate">
                      + {name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {isEdit ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
