"use client";

import { filterFn_includesString } from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const STOCK = {
  in: { label: "In stock", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  low: { label: "Low stock", className: "border-amber-200 bg-amber-50 text-amber-700" },
  out: { label: "Out of stock", className: "border-destructive/30 bg-destructive/10 text-destructive" },
};

const SELECT_CLASS =
  "h-8 w-full cursor-pointer rounded-sm border border-neutral-300 bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-40";

const columns = [
  {
    id: "product",
    header: "Product",
    accessorFn: (r) => `${r.name} ${r.sku} ${r.supplier} ${r.category}`,
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="min-w-0 text-xs">
        <p className="truncate text-sm font-medium text-neutral-900">{row.original.name}</p>
        <p className="truncate text-neutral-500">
          SKU {row.original.sku} · {row.original.supplier}
          {row.original.status !== "active" ? " · draft" : ""}
        </p>
        <p className="truncate text-neutral-400">{row.original.category}</p>
      </div>
    ),
    meta: { cellClassName: "max-w-[280px]" },
  },
  {
    accessorKey: "stockStatus",
    header: "Status",
    filterFn: (row, id, value) => !value || row.getValue(id) === value,
    sortingFn: (a, b) => ["out", "low", "in"].indexOf(a.original.stockStatus) - ["out", "low", "in"].indexOf(b.original.stockStatus),
    cell: ({ getValue }) => (
      <span className={cn("inline-flex rounded-sm border px-1.5 py-0.5 text-[11px] font-medium", STOCK[getValue()].className)}>
        {STOCK[getValue()].label}
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    cell: ({ getValue }) => <span className="tabular-nums font-medium">{getValue()}</span>,
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    accessorKey: "unitPrice",
    header: "Price",
    cell: ({ getValue }) => <span className="tabular-nums">{formatPrice(getValue())}</span>,
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    accessorKey: "value",
    header: "Stock value",
    cell: ({ getValue }) => <span className="tabular-nums">{formatPrice(getValue())}</span>,
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    accessorKey: "soldInPeriod",
    header: "Sold",
    cell: ({ getValue }) => <span className={cn("tabular-nums", getValue() ? "font-medium text-neutral-900" : "text-neutral-400")}>{getValue()}</span>,
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
  {
    id: "daysOfStock",
    header: "Days of stock",
    sortUndefined: "last",
    accessorFn: (r) => r.daysOfStock ?? undefined,
    cell: ({ row }) => {
      const d = row.original.daysOfStock;
      if (d === null) return <span className="text-neutral-400">—</span>;
      return <span className={cn("tabular-nums", d < 14 ? "font-medium text-amber-700" : "")}>{d < 1 ? "< 1" : Math.round(d).toLocaleString("en-GB")}</span>;
    },
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
];

export default function InventoryTable({ rows }) {
  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(r) => r.id}
      emptyMessage="No products match these filters."
      toolbar={(table) => {
        const search = table.getColumn("product");
        const status = table.getColumn("stockStatus");
        const hasFilters = Boolean(search.getFilterValue()) || Boolean(status.getFilterValue());
        return (
          <div className="flex flex-wrap items-end gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search.getFilterValue() ?? ""}
                onChange={(e) => search.setFilterValue(e.target.value)}
                placeholder="Search product, SKU, supplier..."
                className="h-8 pl-8 text-xs"
                aria-label="Search products"
              />
            </div>
            <select
              value={status.getFilterValue() ?? ""}
              onChange={(e) => status.setFilterValue(e.target.value || undefined)}
              className={SELECT_CLASS}
              aria-label="Filter by stock status"
            >
              <option value="">All stock levels</option>
              {Object.entries(STOCK).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
            {hasFilters ? (
              <Button type="button" variant="ghost" className="cursor-pointer rounded-sm px-3 text-xs" onClick={() => table.resetColumnFilters()}>
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            ) : null}
          </div>
        );
      }}
    />
  );
}
