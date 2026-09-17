import Link from "next/link";
import Image from "next/image";
import ImagePlaceholder from "@/components/ui/image-placeholder";
import ProductCardActions from "@/components/cart/ProductCardActions";

function ProductImage({ image, alt, className }) {
  if (!image) return <ImagePlaceholder className={className} />;
  return (
    <div className={`relative ${className}`}>
      <Image
        src={image}
        alt={alt}
        fill
        sizes="240px"
        className="object-cover"
      />
    </div>
  );
}

/**
 * Presentational product card. Takes a plain `product` object so it can be
 * fed either static/mock data or real Supabase rows without changing this
 * component — see lib/data/products.js for the mapping from DB rows.
 *
 * variant "grid" -> tall card used in Our Products / New Arrivals grids.
 * variant "row"  -> compact horizontal row used in Suggested For You.
 */
export default function ProductCard({ product, variant = "grid" }) {
  const {
    id,
    vendor,
    title,
    price,
    image,
    model,
    year,
    manufacturer,
    discount_price,
    stock,
  } = product;

  // `stock` is absent on static/mock data, so only treat an explicit 0 as
  // out of stock.
  const outOfStock = stock !== undefined && stock <= 0;


  if (variant === "row") {
    return (
      <Link
        href={`/products/${id}`}
        className="flex items-center gap-4 rounded-md bg-neutral-50 p-3 transition-colors hover:bg-neutral-100"
      >
        <ProductImage
          image={image}
          alt={title}
          className="size-14 shrink-0 overflow-hidden rounded"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            {vendor}
          </p>
          <p className="truncate text-sm font-medium text-neutral-800">
            {`${manufacturer} ${model} ${year} ${title}`}
          </p>
          {outOfStock ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
              Out of stock
            </p>
          ) : null}
        </div>
        {discount_price !== "£0.00" ? (
          <div className="flex gap-4 items-end">
            <p className="shrink-0 text-lg font-semibold text-neutral-900">
              {discount_price}
            </p>
            <p className="shrink-0 text-sm font-semibold line-through text-neutral-900">
              {price}
            </p>
          </div>
        ) : (
          <p className="shrink-0 text-lg font-semibold text-neutral-900">
            {price}
          </p>
        )}{" "}
      </Link>
    );
  }

  return (
    <div className="group bg-white">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link href={`/products/${id}`}>
          <ProductImage image={image} alt={title} className="h-full w-full" />
        </Link>
        {outOfStock ? (
          <span className="absolute left-3 top-3 rounded-sm bg-neutral-900/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Out of stock
          </span>
        ) : null}
        <ProductCardActions productId={id} inStock={!outOfStock} />
      </div>
      <div className="space-y-3 px-3 pt-4 pb-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
          {vendor}
        </p>
        <Link
          href={`/products/${id}`}
          className="block text-sm font-medium text-neutral-800 hover:text-brand"
        >
          {`${manufacturer} ${model} ${year} ${title}`}
        </Link>
        {discount_price !== "£0.00" ? (
          <div className="flex gap-4 items-end">
            <p className="shrink-0 text-lg font-semibold text-neutral-900">
              {discount_price}
            </p>
            <p className="shrink-0 text-sm font-semibold line-through text-neutral-900">
              {price}
            </p>
          </div>
        ) : (
          <p className="shrink-0 text-lg font-semibold text-neutral-900">
            {price}
          </p>
        )}{" "}
      </div>
    </div>
  );
}
