"use client";

import { Plus, RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { blogColumns } from "@/components/admin/blogs/blog-columns";

const FILTER_INPUT_CLASS =
  "h-8 rounded-sm border border-neutral-300 bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Toolbar({ table }) {
  const titleColumn = table.getColumn("title");
  const statusColumn = table.getColumn("status");

  const hasFilters =
    Boolean(titleColumn.getFilterValue()) || Boolean(statusColumn.getFilterValue());

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={titleColumn.getFilterValue() ?? ""}
            onChange={(e) => titleColumn.setFilterValue(e.target.value)}
            placeholder="Filter by title..."
            className="h-8 pl-8 text-xs"
            aria-label="Filter by title"
          />
        </div>

        <select
          value={statusColumn.getFilterValue() ?? ""}
          onChange={(e) => statusColumn.setFilterValue(e.target.value || undefined)}
          className={`${FILTER_INPUT_CLASS} w-full cursor-pointer sm:w-40`}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {hasFilters ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-sm px-3 text-xs cursor-pointer"
            onClick={() => table.resetColumnFilters()}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </div>

      <div className="flex gap-2">
        <ButtonLink href="/admin/blogs/new" className="rounded-sm px-3 text-xs cursor-pointer">
          <Plus className="size-3.5" />
          Add Blog
        </ButtonLink>
      </div>
    </div>
  );
}

export default function BlogsDataTable({ blogs }) {
  return (
    <DataTable
      columns={blogColumns}
      data={blogs}
      getRowId={(blog) => blog.id}
      emptyMessage="No blogs yet — add your first article."
      toolbar={(table) => <Toolbar table={table} />}
    />
  );
}
