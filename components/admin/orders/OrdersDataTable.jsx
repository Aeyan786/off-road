"use client";

import { filterFn_includesString } from "@tanstack/react-table";
import { RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderDetailsSheet, { formatDateTime } from "@/components/admin/orders/OrderDetailsSheet";
import OrderStatusActions from "@/components/admin/orders/OrderStatusActions";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/orders/StatusBadges";
import { ORDER_STATUSES, formatOrderNumber } from "@/lib/order-status";
import { addressLines, sameAddress } from "@/lib/format-address";
import { formatPrice } from "@/lib/format";

const FILTER_CLASS =
  "h-8 w-full cursor-pointer rounded-sm border border-neutral-300 bg-background px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-40";

const columns = [
  {
    id: "order",
    header: "Order",
    accessorFn: (o) => o.order_number,
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-neutral-900">{formatOrderNumber(row.original.order_number)}</p>
        <p className="text-xs text-neutral-400">{formatDateTime(row.original.created_at)}</p>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    // Search matches name, email, phone and order number.
    accessorFn: (o) => `${o.full_name} ${o.email} ${o.phone} ${o.order_number}`,
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="min-w-0 text-xs">
        <p className="truncate text-sm font-medium text-neutral-900">{row.original.full_name}</p>
        <p className="truncate text-neutral-500">{row.original.email}</p>
        <p className="truncate text-neutral-500">{row.original.phone}</p>
      </div>
    ),
    meta: { cellClassName: "max-w-[220px]" },
  },
  {
    id: "items",
    header: "Items",
    enableSorting: false,
    cell: ({ row }) => (
      <ul className="space-y-0.5 text-xs">
        {row.original.order_items.map((item) => (
          <li key={item.id} className="max-w-[240px] truncate text-neutral-700">
            <span className="font-medium text-neutral-900">{item.quantity}×</span> {item.product_name}{" "}
            <span className="text-neutral-400">@ {formatPrice(item.unit_price)}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "ship_to",
    header: "Ship to",
    enableSorting: false,
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="max-w-[200px] text-xs text-neutral-600">
          <p className="truncate">{addressLines(o.shipping_address).join(", ")}</p>
          <p className="truncate text-neutral-400">
            Billing: {sameAddress(o.shipping_address, o.billing_address) ? "same" : addressLines(o.billing_address).join(", ")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="text-xs">
          <p className="text-sm font-semibold text-neutral-900">{formatPrice(o.total)}</p>
          <p className="text-neutral-400">
            {formatPrice(o.subtotal)} + {Number(o.shipping_cost) > 0 ? formatPrice(o.shipping_cost) : "free"} shipping
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "payment_status",
    header: "Payment",
    cell: ({ getValue }) => <PaymentStatusBadge status={getValue()} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, id, value) => !value || row.getValue(id) === value,
    cell: ({ row }) => (
      <div className="space-y-1">
        <OrderStatusBadge status={row.original.status} />
        {row.original.tracking_number ? (
          <p className="max-w-[140px] truncate text-[11px] text-neutral-500" title={row.original.tracking_number}>
            {row.original.tracking_number}
          </p>
        ) : null}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <OrderStatusActions order={row.original} compact />
        <OrderDetailsSheet order={row.original} />
      </div>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
];

function Toolbar({ table }) {
  const search = table.getColumn("customer");
  const status = table.getColumn("status");
  const hasFilters = Boolean(search.getFilterValue()) || Boolean(status.getFilterValue());

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={search.getFilterValue() ?? ""}
          onChange={(e) => search.setFilterValue(e.target.value)}
          placeholder="Search order #, name, email or phone..."
          className="h-8 pl-8 text-xs"
          aria-label="Search orders"
        />
      </div>
      <select
        value={status.getFilterValue() ?? ""}
        onChange={(e) => status.setFilterValue(e.target.value || undefined)}
        className={FILTER_CLASS}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {Object.entries(ORDER_STATUSES).map(([key, meta]) => (
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
}

export default function OrdersDataTable({ orders }) {
  return (
    <DataTable
      columns={columns}
      data={orders}
      getRowId={(o) => o.id}
      emptyMessage="No orders match these filters."
      toolbar={(table) => <Toolbar table={table} />}
    />
  );
}
