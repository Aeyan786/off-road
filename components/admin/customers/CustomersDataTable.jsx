"use client";

import { filterFn_includesString } from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addressLines, sameAddress } from "@/lib/format-address";
import { formatBlogDate } from "@/lib/blog-text";
import { formatPrice } from "@/lib/format";

function AddressCell({ address }) {
  return (
    <address className="max-w-[220px] text-xs not-italic leading-relaxed text-neutral-600">
      {addressLines(address).map((line) => (
        <span key={line} className="block">{line}</span>
      ))}
    </address>
  );
}

const columns = [
  {
    id: "customer",
    header: "Customer",
    accessorFn: (c) => `${c.full_name} ${c.email} ${c.phone}`,
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="min-w-0 text-xs">
        <p className="truncate text-sm font-medium text-neutral-900">{row.original.full_name}</p>
        <a href={`mailto:${row.original.email}`} className="block cursor-pointer truncate text-neutral-500 hover:text-brand hover:underline">
          {row.original.email}
        </a>
        <a href={`tel:${row.original.phone}`} className="block cursor-pointer truncate text-neutral-500 hover:text-brand hover:underline">
          {row.original.phone}
        </a>
      </div>
    ),
    meta: { cellClassName: "max-w-[240px]" },
  },
  {
    id: "shipping",
    header: "Shipping address",
    enableSorting: false,
    cell: ({ row }) => <AddressCell address={row.original.shipping_address} />,
  },
  {
    id: "billing",
    header: "Billing address",
    enableSorting: false,
    cell: ({ row }) =>
      sameAddress(row.original.shipping_address, row.original.billing_address) ? (
        <span className="text-xs text-neutral-400">Same as shipping</span>
      ) : (
        <AddressCell address={row.original.billing_address} />
      ),
  },
  {
    accessorKey: "orderCount",
    header: "Orders",
    cell: ({ getValue }) => <span className="tabular-nums font-medium">{getValue()}</span>,
  },
  {
    accessorKey: "totalSpent",
    header: "Total spent",
    cell: ({ getValue }) => <span className="tabular-nums">{formatPrice(getValue())}</span>,
  },
  {
    accessorKey: "lastOrderAt",
    header: "Orders placed",
    cell: ({ row }) => (
      <div className="text-xs text-neutral-500">
        <p>Last: {formatBlogDate(row.original.lastOrderAt) || "—"}</p>
        <p className="text-neutral-400">First: {formatBlogDate(row.original.firstOrderAt) || "—"}</p>
      </div>
    ),
  },
];

function Toolbar({ table }) {
  const search = table.getColumn("customer");
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={search.getFilterValue() ?? ""}
          onChange={(e) => search.setFilterValue(e.target.value)}
          placeholder="Search name, email or phone..."
          className="h-8 pl-8 text-xs"
          aria-label="Search customers"
        />
      </div>
      {search.getFilterValue() ? (
        <Button type="button" variant="ghost" className="cursor-pointer rounded-sm px-3 text-xs" onClick={() => table.resetColumnFilters()}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}

export default function CustomersDataTable({ customers }) {
  return (
    <DataTable
      columns={columns}
      data={customers}
      getRowId={(c) => c.id}
      emptyMessage="No customers yet — they appear here after their first paid order."
      toolbar={(table) => <Toolbar table={table} />}
    />
  );
}
