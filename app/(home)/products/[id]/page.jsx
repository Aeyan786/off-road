import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, PackageCheck, PackageX, ShieldCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  categoryPath,
  getProductById,
  getRelatedProducts,
  toStorefrontProduct,
} from "@/lib/data/products";
import { safeQuery } from "@/lib/data/safe";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/home/ProductGrid";
import ProductActions from "@/components/cart/ProductActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const product = await safeQuery(getProductById(supabase, id), null);

  return {
    title: product ? `${product.product} | Off Road Performance` : "Product | Off Road Performance",
    description: product?.small_description ?? undefined,
  };
}

/** A label/value row for the compact spec list under the buy box. */
function Spec({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-2.5 text-sm">
      <dt className="w-40 shrink-0 text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-800">{value}</dd>
    </div>
  );
}

/** A row inside the "Features" table (in the tabs section). */
function FeatureRow({ label, value, index }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div
      className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-6 ${
        index % 2 === 0 ? "bg-neutral-50" : "bg-white"
      }`}
    >
      <span className="w-full shrink-0 text-sm font-medium text-neutral-500 sm:w-56">
        {label}
      </span>
      <span className="text-sm font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

function LongText({ value, emptyMessage }) {
  if (!value) {
    return (
      <p className="text-sm italic text-neutral-400">{emptyMessage}</p>
    );
  }
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
      {value}
    </p>
  );
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const product = await safeQuery(getProductById(supabase, id), null);
  if (!product) notFound();

  const related = await safeQuery(
    getRelatedProducts(supabase, {
      categoryId: product.categories?.id,
      excludeId: product.id,
      limit: 4,
    }),
    []
  );

  const hasDiscount =
    product.discount_price !== null && product.discount_price !== undefined;
  const inStock = (product.quantity ?? 0) > 0;
  const breadcrumb = categoryPath(product.categories);
  const dimensions = [product.width, product.length, product.height].every(
    (value) => value !== null && value !== undefined
  )
    ? `${product.width} × ${product.length} × ${product.height} cm`
    : null;

  const featureRows = [
    { label: "SKU", value: product.sku },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Model", value: product.model },
    { label: "Year", value: product.year },
    { label: "Category", value: breadcrumb },
    { label: "Dimensions (W × L × H)", value: dimensions },
    {
      label: "Weight",
      value: product.weight_grams ? `${product.weight_grams} g` : null,
    },
    { label: "Supplier", value: product.supplier },
  ].filter((row) => row.value !== null && row.value !== undefined && row.value !== "");

  return (
    <div className="mx-auto max-w-[1300px] px-6 py-10">
      {/* BREADCRUMB */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/" className="cursor-pointer hover:text-[#1B9DDB]">
          Home
        </Link>
        {breadcrumb ? (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{breadcrumb}</span>
          </>
        ) : null}
      </nav>

      {/* TOP SECTION: GALLERY + BUY BOX */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} alt={product.product} />

        <div className="space-y-5">
          <div className="space-y-2">
            {product.supplier ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1B9DDB]">
                {product.supplier}
              </p>
            ) : null}
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              {product.product}
            </h1>
            {product.small_description ? (
              <p className="text-sm leading-relaxed text-neutral-600">
                {product.small_description}
              </p>
            ) : null}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {priceFormatter.format(
                hasDiscount ? product.discount_price : product.price ?? 0
              )}
            </span>
            {hasDiscount ? (
              <span className="text-lg text-neutral-400 line-through">
                {priceFormatter.format(product.price ?? 0)}
              </span>
            ) : null}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              inStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {inStock ? (
              <PackageCheck className="h-3.5 w-3.5" />
            ) : (
              <PackageX className="h-3.5 w-3.5" />
            )}
            {inStock ? `In stock — ${product.quantity} available` : "Out of stock"}
          </div>

          <ProductActions productId={product.id} inStock={inStock} />

          {/* TRUST BADGES */}
          <div className="grid grid-cols-2 gap-3 border-y border-neutral-100 py-4">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Truck className="h-4 w-4 text-[#1B9DDB]" />
              Fast, tracked delivery
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <ShieldCheck className="h-4 w-4 text-[#1B9DDB]" />
              Guaranteed fitment
            </div>
          </div>

          {/* COMPACT SPEC LIST */}
          <dl className="divide-y divide-neutral-100">
            <Spec label="SKU" value={product.sku} />
            <Spec label="Manufacturer" value={product.manufacturer} />
            <Spec label="Model" value={product.model} />
            <Spec label="Year" value={product.year} />
          </dl>
        </div>
      </div>

      {/* TABS SECTION: FEATURES / DESCRIPTION / ADDITIONAL INFO */}
      <div className="mt-14">
        <Tabs defaultValue="features" className="w-full">
          <TabsList variant="line" className="h-auto w-full justify-start gap-6 rounded-none border-b border-neutral-200 bg-transparent p-0">
            <TabsTrigger
              value="features"
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-1 text-sm font-semibold text-neutral-500 shadow-none data-[state=active]:border-[#1B9DDB] data-[state=active]:bg-transparent data-[state=active]:text-[#1B9DDB] data-[state=active]:shadow-none"
            >
              Features
            </TabsTrigger>
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-1 text-sm font-semibold text-neutral-500 shadow-none data-[state=active]:border-[#1B9DDB] data-[state=active]:bg-transparent data-[state=active]:text-[#1B9DDB] data-[state=active]:shadow-none"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="additional"
              className="rounded-none border-b-2 border-transparent px-1 pb-3 pt-1 text-sm font-semibold text-neutral-500 shadow-none data-[state=active]:border-[#1B9DDB] data-[state=active]:bg-transparent data-[state=active]:text-[#1B9DDB] data-[state=active]:shadow-none"
            >
              Additional Information
            </TabsTrigger>
          </TabsList>

          {/* FEATURES TABLE */}
          <TabsContent value="features" className="mt-6">
            {featureRows.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                {featureRows.map((row, index) => (
                  <FeatureRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-neutral-400">
                No feature specifications available for this product.
              </p>
            )}
          </TabsContent>

          {/* DESCRIPTION */}
          <TabsContent value="description" className="mt-6">
            <div className="max-w-3xl">
              <LongText
                value={product.description}
                emptyMessage="No description has been added for this product yet."
              />
            </div>
          </TabsContent>

          {/* ADDITIONAL INFORMATION */}
          <TabsContent value="additional" className="mt-6">
            <div className="max-w-3xl">
              <LongText
                value={product.additional_information}
                emptyMessage="No additional information has been added for this product yet."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-neutral-900">
            You may also like
          </h2>
          <ProductGrid products={related.map(toStorefrontProduct)} />
        </section>
      ) : null}
    </div>
  );
}