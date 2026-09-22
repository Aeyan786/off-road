"use client";

import { useState } from "react";
import { Plus, RotateCcw, Search, Upload } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import BulkUploadDialog from "@/components/admin/products/BulkUploadDialog";
import BulkDeleteProductsDialog from "@/components/admin/products/BulkDeleteProductsDialog";
import { productColumns } from "@/components/admin/products/product-columns";

const FILTER_INPUT_CLASS =
  "h-8 rounded-sm border border-neutral-300 bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function Toolbar({ table, categoryOptions, uploadOpen, setUploadOpen }) {
  const nameColumn = table.getColumn("product");
  const categoryColumn = table.getColumn("category");
  const priceColumn = table.getColumn("price");

  const [minPrice, maxPrice] = priceColumn.getFilterValue() ?? ["", ""];

  function setPriceRange(min, max) {
    const toNumber = (value) =>
      value === "" || value === null || value === undefined ? undefined : Number(value);
    const next = [toNumber(min), toNumber(max)];
    priceColumn.setFilterValue(next[0] === undefined && next[1] === undefined ? undefined : next);
  }

  const hasFilters =
    Boolean(nameColumn.getFilterValue()) ||
    Boolean(categoryColumn.getFilterValue()) ||
    Boolean(priceColumn.getFilterValue());

  const selectedProducts = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={nameColumn.getFilterValue() ?? ""}
            onChange={(e) => nameColumn.setFilterValue(e.target.value)}
            placeholder="Filter by product name..."
            className="h-8 pl-8 text-xs"
            aria-label="Filter by product name"
          />
        </div>

        <select
          value={categoryColumn.getFilterValue() ?? ""}
          onChange={(e) => categoryColumn.setFilterValue(e.target.value || undefined)}
          className={`${FILTER_INPUT_CLASS} w-full cursor-pointer sm:w-56`}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categoryOptions.map((option) => (
            <option key={option.id} value={option.path}>
              {option.path}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={minPrice ?? ""}
            onChange={(e) => setPriceRange(e.target.value, maxPrice ?? "")}
            placeholder="Min £"
            className="h-8 w-24 text-xs"
            aria-label="Minimum price"
          />
          <span className="text-xs text-neutral-400">–</span>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={maxPrice ?? ""}
            onChange={(e) => setPriceRange(minPrice ?? "", e.target.value)}
            placeholder="Max £"
            className="h-8 w-24 text-xs"
            aria-label="Maximum price"
          />
        </div>

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
        {selectedProducts.length > 0 ? (
          <BulkDeleteProductsDialog
            products={selectedProducts}
            onDeleted={() => table.resetRowSelection()}
          />
        ) : null}
        <BulkUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          trigger={
            <Button type="button" variant="outline" className="rounded-sm px-3 text-xs cursor-pointer">
              <Upload className="size-3.5" />
              Bulk Upload
            </Button>
          }
        />
        <ButtonLink href="/admin/products/new" className="rounded-sm px-3 text-xs cursor-pointer">
          <Plus className="size-3.5" />
          Add Product
        </ButtonLink>
      </div>
    </div>
  );
}

export default function ProductsDataTable({
  products,
  categoryOptions = [],
  initialUploadOpen = false,
}) {
  const [uploadOpen, setUploadOpen] = useState(initialUploadOpen);

  return (
    <DataTable
      columns={productColumns}
      data={products}
      getRowId={(product) => product.id}
      emptyMessage="No products match these filters."
      toolbar={(table) => (
        <Toolbar
          table={table}
          categoryOptions={categoryOptions}
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
        />
      )}
    />
  );
}
