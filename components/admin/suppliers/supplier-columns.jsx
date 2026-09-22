"use client";

import Link from "next/link";
import { filterFn_includesString } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupplierFormDialog from "@/components/admin/suppliers/SupplierFormDialog";
import DeleteSupplierDialog from "@/components/admin/suppliers/DeleteSupplierDialog";
import { formatBlogDate } from "@/lib/blog-text";

/** Column definitions for the suppliers DataTable. */
export const supplierColumns = [
  {
    accessorKey: "name",
    header: "Supplier",
    filterFn: filterFn_includesString,
    cell: ({ getValue }) => <span className="font-medium text-neutral-900">{getValue()}</span>,
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => {
      const count = row.original.productCount;
      return count > 0 ? (
        <Link
          href={`/products?${new URLSearchParams({ supplier: row.original.name })}`}
          target="_blank"
          className="cursor-pointer tabular-nums text-brand hover:underline"
          title="View this supplier's products on the storefront"
        >
          {count.toLocaleString("en-GB")}
        </Link>
      ) : (
        <span className="tabular-nums text-neutral-400">0</span>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "Last updated",
    cell: ({ getValue }) => (
      <span className="text-xs text-neutral-500">{formatBlogDate(getValue())}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <SupplierFormDialog
          supplier={row.original}
          trigger={
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Edit ${row.original.name}`}
              className="rounded-sm cursor-pointer"
            >
              <Pencil className="size-3.5" />
            </Button>
          }
        />
        <DeleteSupplierDialog supplier={row.original} />
      </div>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
];
