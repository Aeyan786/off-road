import { createClient } from "@/lib/supabase/server";
import { getCategoryTree } from "@/lib/data/categories";
import CategoryManager from "@/components/admin/categories/CategoryManager";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";

export const metadata = {
  title: "Manage Categories | Off Road Performance",
};

export default async function ManageCategoriesPage() {
  const supabase = await createClient();

  let categories = [];
  let setupError = null;
  try {
    categories = await getCategoryTree(supabase);
  } catch (err) {
    setupError = err.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Manage Categories
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Two levels: a top-level category (e.g. &quot;ATV&quot;) contains
          subcategories (e.g. &quot;ATV Exhaust&quot;). Products attach to a
          subcategory.
        </p>
      </div>

      {setupError ? <SetupRequiredBanner message={setupError} /> : null}

      <CategoryManager categories={categories} />
    </div>
  );
}
