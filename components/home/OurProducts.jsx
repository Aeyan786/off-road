import ButtonLink from "@/components/ui/button-link";
import ProductGrid from "@/components/home/ProductGrid";

/**
 * Intentionally rendered with no data yet — real products will come from
 * Supabase once the admin "Manage Products" module writes to the database.
 * `products` defaults to an empty array so the grid is ready to receive
 * real rows without further layout changes.
 */
export default function OurProducts({ products = [] }) {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Our Products
          </h2>
          <p className="mt-3 text-sm text-neutral-500">
            Quality parts sourced from trusted manufacturers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="flex flex-col justify-center gap-4 bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              The #1 supplier of car parts
            </p>
            <h3 className="text-2xl font-bold leading-snug text-neutral-900">
              Providing high-quality car parts for any brands
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500">
             We provide high-quality car parts for all major brands, ensuring reliable performance, durability, and a perfect fit for every vehicle.

            </p>
            <ButtonLink href="/" className="w-fit">
              Get New Plans
            </ButtonLink>
          </div>

          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-400">
                Products will appear here once they&apos;re added.
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-center">
          <ButtonLink href="/">View All</ButtonLink>
        </div>
      </div>
    </section>
  );
}
