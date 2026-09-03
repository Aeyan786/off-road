import { MOCK_PRODUCTS } from "@/lib/mock-products";
import ProductGrid from "@/components/home/ProductGrid";

export default function NewArrivals() {
  const products = MOCK_PRODUCTS.slice(0, 4);

  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            New Arrivals
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-500">
            Pellentesque habitant morbi tristique senectus. Tortor at risus
            viverra adipiscing at in tellus integer.
          </p>
        </div>

        <ProductGrid products={products} />
      </div>
    </section>
  );
}
