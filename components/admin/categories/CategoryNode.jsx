"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryFormDialog from "@/components/admin/categories/CategoryFormDialog";
import DeleteCategoryDialog from "@/components/admin/categories/DeleteCategoryDialog";

/** Renders one category and recurses into its children, at any depth. */
export default function CategoryNode({ category, depth = 0 }) {
  const hasChildren = category.children?.length > 0;

  return (
    <div className={depth > 0 ? "border-l pl-4" : ""}>
      <div className="flex items-center justify-between rounded-md py-2">
        <span className={depth === 0 ? "font-semibold text-neutral-900" : "text-sm text-neutral-700"}>
          {category.name}
        </span>
        <div className="flex items-center gap-1.5">
          <CategoryFormDialog
            parentId={category.id}
            parentName={category.name}
            trigger={
              <Button type="button" size="icon-xs" variant="outline" aria-label={`Add category under ${category.name}`}>
                <Plus className="size-3" />
              </Button>
            }
          />
          <DeleteCategoryDialog
            category={category}
            isParent={hasChildren}
            trigger={
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label={`Delete ${category.name}`}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3" />
              </Button>
            }
          />
        </div>
      </div>

      {hasChildren ? (
        <div className="space-y-0.5">
          {category.children.map((child) => (
            <CategoryNode key={child.id} category={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
