import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";
import ProductGrid from "@/components/home/ProductGrid";

/**
 * New arrivals on the homepage.
 *
 * The products are chosen by the shared rule in lib/data/products.js
 * (active, created inside the new-arrival window, newest first), and the
 * grid is the same ProductGrid/ProductCard the rest of the site uses, so
 * images, titles, prices and discounts stay consistent. "View all new
 * arrivals" goes to /new-arrivals — the shared catalogue page with the
 * normal filters — rather than a duplicate listing.
 */
export default function NewArrivals({ products = [] }) {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            New arrivals
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
            Discover the newest additions to our store.
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <ProductGrid products={products} columns={5} />

            <div className="mt-10 text-center">
              <ButtonLink href="/new-arrivals" className="cursor-pointer">
                View all new arrivals
                <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-neutral-300 py-16 text-center">
            <p className="text-sm font-medium text-neutral-700">
              No new arrivals at the moment.
            </p>
            <p className="text-xs text-neutral-500">
              Nothing has been added recently — browse the full catalogue instead.
            </p>
            <ButtonLink href="/products" variant="outline" className="cursor-pointer">
              Browse all products
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
