import ButtonLink from "@/components/ui/button-link";
import ProductCard from "./ProductCard";

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

        {/* First row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Get New Plans */}
          <div className="flex flex-col justify-center gap-4 bg-white p-8 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              The #1 supplier of car parts
            </p>

            <h3 className="text-2xl font-bold leading-snug text-neutral-900">
              Providing high-quality car parts for any brands
            </h3>

            <p className="text-sm leading-relaxed text-neutral-500">
              We provide high-quality car parts for all major brands, ensuring
              reliable performance, durability, and a perfect fit for every
              vehicle.
            </p>

            <ButtonLink href="/" className="w-fit">
              Get New Plans
            </ButtonLink>
          </div>

          {/* Products 1–3 */}
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Second row - Products 4–8 */}
        {products.length > 3 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {products.slice(3, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <ButtonLink href="/">View All</ButtonLink>
        </div>
      </div>
    </section>
  );
}