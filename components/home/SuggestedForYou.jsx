import { MOCK_PRODUCTS } from "@/lib/mock-products";
import ProductCard from "@/components/home/ProductCard";

const TABS = ["ATV Cylinder", "All"];

export default function SuggestedForYou() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">
          Suggested For You
        </h2>
        <div className="flex gap-2">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              type="button"
              className={`rounded-md border px-4 py-1.5 text-sm font-medium ${
                i === 0
                  ? "border-brand text-brand"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} variant="row" />
        ))}
      </div>
    </section>
  );
}
