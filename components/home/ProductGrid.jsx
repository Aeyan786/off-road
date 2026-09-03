import ProductCard from "@/components/home/ProductCard";

export default function ProductGrid({ products, className = "" }) {
  if (!products?.length) return null;

  return (
    <div
      className={`grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
