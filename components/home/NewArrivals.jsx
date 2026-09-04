import { MOCK_PRODUCTS } from "@/lib/mock-products";
import ProductGrid from "@/components/home/ProductGrid";

export default function NewArrivals({products}) {

  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            New Arrivals
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
           Discover our latest car parts, featuring quality products and the newest additions to our collection.

          </p>
        </div>

        <ProductGrid products={products} />
      </div>
    </section>
  );
}
