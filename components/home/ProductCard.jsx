import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, RefreshCw, ShoppingBag } from "lucide-react";
import ImagePlaceholder from "@/components/ui/image-placeholder";

const HOVER_ACTIONS = [RefreshCw, Eye, ShoppingBag, Heart];

function ProductImage({ image, alt, className }) {
  if (!image) return <ImagePlaceholder className={className} />;
  return (
    <div className={`relative ${className}`}>
      <Image src={image} alt={alt} fill sizes="240px" className="object-cover" />
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
  const { vendor, title, price, image } = product;
  console.log(product);
  

  if (variant === "row") {
    return (
      <Link
        href="/"
        className="flex items-center gap-4 rounded-md bg-neutral-50 p-3 transition-colors hover:bg-neutral-100"
      >
        <ProductImage image={image} alt={title} className="size-14 shrink-0 overflow-hidden rounded" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
            {vendor}
          </p>
          <p className="truncate text-sm font-medium text-neutral-800">
            {title}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-neutral-900">
          {price}
        </p>
      </Link>
    );
  }

  return (
    <div className="group bg-white">
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Link href="/">
          <ProductImage image={image} alt={title} className="h-full w-full" />
        </Link>
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {HOVER_ACTIONS.map((Icon, i) => (
            <button
              key={i}
              type="button"
              className="flex size-8 items-center justify-center rounded-full bg-black/80 text-white hover:bg-brand"
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1 px-1 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">
          {vendor}
        </p>
        <Link
          href="/"
          className="block text-sm font-medium text-neutral-800 hover:text-brand"
        >
          {title}
        </Link>
        <p className="text-sm font-semibold text-neutral-900">{price}</p>
      </div>
    </div>
  );
}
