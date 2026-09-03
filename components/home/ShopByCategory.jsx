import ImagePlaceholder from "@/components/ui/image-placeholder";

/**
 * Intentionally rendered with no data yet — categories will come from
 * Supabase once the schema is confirmed. `categories` defaults to an empty
 * array so the grid is ready to receive real records without further
 * layout changes.
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
            <div key={category.id} className="flex flex-col items-center gap-4">
              <ImagePlaceholder className="size-28 rounded-full" />
              <p className="text-sm font-medium text-neutral-800">
                {category.name}
              </p>
            </div>
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
