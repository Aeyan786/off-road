import { notFound } from "next/navigation";
import Link from "next/link";
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

/** A label/value row, hidden entirely when the product has no value for it. */
function Spec({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-3 py-2 text-sm">
      <dt className="w-40 shrink-0 text-neutral-500">{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </div>
  );
}

function LongText({ title, value }) {
  if (!value) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
        {value}
      </p>
    </section>
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
    ? `${product.width} × ${product.length} × ${product.height}`
    : null;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <nav className="mb-6 text-xs text-neutral-500">
        <Link href="/" className="cursor-pointer hover:text-brand">
          Home
        </Link>
        {breadcrumb ? <span className="mx-2">/</span> : null}
        {breadcrumb}
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} alt={product.product} />

        <div className="space-y-5">
          <div className="space-y-2">
            {product.supplier ? (
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
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

          <p
            className={
              inStock
                ? "text-sm font-medium text-emerald-700"
                : "text-sm font-medium text-destructive"
            }
          >
            {inStock ? `In stock — ${product.quantity} available` : "Out of stock"}
          </p>

          <ProductActions productId={product.id} inStock={inStock} />

          <dl className="divide-y border-y">
            <Spec label="SKU" value={product.sku} />
            <Spec label="Manufacturer" value={product.manufacturer} />
            <Spec label="Model" value={product.model} />
            <Spec label="Year" value={product.year} />
            <Spec label="Category" value={breadcrumb} />
            <Spec label="Dimensions (W × L × H)" value={dimensions} />
            <Spec
              label="Weight"
              value={product.weight_grams ? `${product.weight_grams} g` : null}
            />
          </dl>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        <LongText title="Description" value={product.description} />
        <LongText title="Additional Information" value={product.additional_information} />
      </div>

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
