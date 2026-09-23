import { FolderTree, FolderOpen, Folders } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { countCategoryLevels, getCategoryTree } from "@/lib/data/categories";
import CategoryManager from "@/components/admin/categories/CategoryManager";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";

export const metadata = {
  title: "Manage Categories",
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

  const [top = 0, sub = 0, subSub = 0, ...deeper] = countCategoryLevels(categories);
  const deeperCount = deeper.reduce((total, count) => total + (count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Categories" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">
          Manage Categories
        </h1>
        <p className="text-sm text-neutral-500">
          Two levels: a top-level category (e.g. &quot;ATV&quot;) contains
          subcategories (e.g. &quot;ATV Exhaust&quot;). Products attach to a
          subcategory.
        </p>
      </div>

      {setupError ? <SetupRequiredBanner message={setupError} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Categories"
          value={top}
          hint="Top-level, e.g. ATV"
          icon={FolderTree}
        />
        <StatCard
          title="Subcategories"
          value={sub}
          hint="Second level, e.g. ATV Exhaust"
          icon={Folders}
        />
        <StatCard
          title="Sub-subcategories"
          value={subSub + deeperCount}
          hint={
            deeperCount > 0
              ? `Third level, plus ${deeperCount} nested deeper`
              : "Third level, e.g. ATV Header Pipe"
          }
          icon={FolderOpen}
        />
      </div>

      <CategoryManager categories={categories} />
    </div>
  );
}
