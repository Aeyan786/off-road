"use client";

import Image from "next/image";
import { filterFn_includesString } from "@tanstack/react-table";
import { ImageIcon, Pencil } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";
import { Checkbox } from "@/components/ui/checkbox";
import DeleteProductDialog from "@/components/admin/products/DeleteProductDialog";
import ProductStatusSelect from "@/components/admin/products/ProductStatusSelect";
import { categoryPath } from "@/lib/data/products";

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Column definitions for the products DataTable. */
export const productColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        aria-label="Select all products on this page"
        className="cursor-pointer"
      />
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
        aria-label={`Select ${row.original.product}`}
        className="cursor-pointer"
      />
    ),
    meta: { cellClassName: "w-10" },
  },
  {
    id: "image",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      const image = row.original.images?.[0];
      return (
        <div className="relative size-10 overflow-hidden rounded-sm border bg-neutral-100">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center">
              <ImageIcon className="size-4 text-neutral-300" />
            </span>
          )}
        </div>
      );
    },
    meta: { cellClassName: "w-14" },
  },
  {
    accessorKey: "product",
    header: "Product",
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-neutral-900">{row.original.product}</p>
        <p className="truncate text-xs text-neutral-400">
          {[row.original.manufacturer, row.original.model, row.original.year]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    ),
    meta: { cellClassName: "max-w-[260px]" },
  },
  {
    id: "category",
    header: "Category",
    accessorFn: (row) => categoryPath(row.categories) ?? "",
    // Matching on the breadcrumb prefix means picking a parent category also
    // shows everything filed underneath it.
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      return row.getValue(columnId).startsWith(filterValue);
    },
    cell: ({ getValue }) => (
      <span className="text-xs text-neutral-500">{getValue() || "—"}</span>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ getValue }) => (
      <span className="text-xs text-neutral-500">{getValue()}</span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    filterFn: (row, columnId, filterValue) => {
      const [min, max] = filterValue ?? [];
      const price = Number(row.getValue(columnId) ?? 0);
      if (min !== undefined && min !== null && price < min) return false;
      if (max !== undefined && max !== null && price > max) return false;
      return true;
    },
    cell: ({ getValue }) => priceFormatter.format(getValue() ?? 0),
  },
  {
    accessorKey: "discount_price",
    header: "Discount",
    cell: ({ getValue }) => {
      const value = getValue();
      return value === null || value === undefined ? (
        <span className="text-neutral-400">—</span>
      ) : (
        priceFormatter.format(value)
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <ProductStatusSelect product={row.original} />,
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <ButtonLink
          href={`/admin/products/${row.original.id}/edit`}
          size="icon-sm"
          variant="ghost"
          aria-label={`Edit ${row.original.product}`}
          className="rounded-sm cursor-pointer"
        >
          <Pencil className="size-3.5" />
        </ButtonLink>
        <DeleteProductDialog product={row.original} />
      </div>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
];
