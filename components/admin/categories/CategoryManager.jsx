"use client";

import { FolderTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CategoryFormDialog from "@/components/admin/categories/CategoryFormDialog";
import CategoryNode from "@/components/admin/categories/CategoryNode";

/**
 * `categories` is a tree (top-level nodes with nested `.children`, any
 * depth) from lib/data/categories.js#getCategoryTree. Each node can have
 * more categories added under it and can be deleted (with confirmation).
 */
export default function CategoryManager({ categories }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoryFormDialog
          trigger={
            <Button type="button">
              <Plus className="size-4" />
              Add Category
            </Button>
          }
        />
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-16 text-neutral-400">
          <FolderTree className="size-8" />
          <p className="text-sm font-medium text-neutral-600">
            No categories yet
          </p>
          <p className="text-xs text-neutral-400">
            Add a top-level category (e.g. &quot;ATV&quot;) to get started.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y">
            {categories.map((category) => (
              <div key={category.id} className="py-2 first:pt-0 last:pb-0">
                <CategoryNode category={category} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
