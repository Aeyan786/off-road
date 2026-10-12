import ProductCard from "@/components/home/ProductCard";

// Tailwind needs literal class names, so each layout is spelled out.
const COLUMNS = {
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  // Same widths as the Our products and Suggested For You rows.
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
};

export default function ProductGrid({ products, columns = 4, className = "" }) {
  if (!products?.length) return null;

  return (
    <div className={`grid gap-x-6 gap-y-10 ${COLUMNS[columns] ?? COLUMNS[4]} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
