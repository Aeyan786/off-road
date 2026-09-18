import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ImagePlaceholder from "@/components/ui/image-placeholder";

/**
 * Second-level categories, each shown with the first image of its first
 * product (see lib/data/categories.js#withCategoryImages). Categories with
 * no imaged products fall back to the placeholder.
 */
export default function ShopByCategory({ categories = [] }) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16 text-center">
      <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
        Shop By Category
      </h2>
      <p className="mt-3 text-sm text-neutral-500">
        Browse parts and accessories organized by category.
      </p>

      {categories.length > 0 ? (
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center gap-4"
            >
              <div className="relative aspect-square w-full max-w-48 overflow-hidden rounded-sm bg-neutral-100">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="192px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                ) : (
                  <ImagePlaceholder className="h-full w-full" />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/0 transition-colors duration-300 group-hover:bg-neutral-900/35">
                  <span className="flex size-12 scale-75 items-center justify-center rounded-full bg-brand text-white opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:scale-100 group-hover:opacity-100">
                    <ArrowUpRight className="size-5" />
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-neutral-800 transition-colors group-hover:text-brand">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-lg border border-dashed border-neutral-300 py-16 text-sm text-neutral-400">
          Categories will appear here once they&apos;re added.
        </div>
      )}
    </section>
  );
}
