"use client";

import { filterFn_includesString } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { OrderStatusBadge } from "@/components/admin/orders/StatusBadges";
import { formatDateTime } from "@/components/admin/orders/OrderDetailsSheet";
import { formatOrderNumber } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";

const columns = [
  {
    id: "order",
    header: "Order",
    accessorFn: (o) => `${o.order_number} ${o.full_name} ${o.email}`,
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="text-xs">
        <p className="text-sm font-semibold text-neutral-900">{formatOrderNumber(row.original.order_number)}</p>
        <p className="text-neutral-500">{row.original.full_name}</p>
      </div>
    ),
  },
  {
    accessorKey: "paid_at",
    header: "Paid",
    cell: ({ getValue }) => <span className="text-xs text-neutral-600">{formatDateTime(getValue())}</span>,
  },
  {
    id: "items",
    header: "Items",
    accessorFn: (o) => o.order_items.reduce((n, i) => n + i.quantity, 0),
    cell: ({ row }) => (
      <ul className="space-y-0.5 text-xs">
        {row.original.order_items.map((item, i) => (
          <li key={i} className="max-w-[260px] truncate text-neutral-700">
            <span className="font-medium text-neutral-900">{item.quantity}×</span> {item.product_name}
          </li>
        ))}
      </ul>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <OrderStatusBadge status={getValue()} />,
  },
  {
    accessorKey: "amount_paid",
    header: "Paid amount",
    cell: ({ row }) => (
      <span className={row.original.status === "cancelled" ? "tabular-nums text-neutral-400 line-through" : "tabular-nums font-medium"}>
        {formatPrice(row.original.amount_paid)}
      </span>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
];

export default function SalesOrdersTable({ orders }) {
  return (
    <DataTable
      columns={columns}
      data={orders}
      getRowId={(o) => o.id}
      emptyMessage="No orders in this period."
      toolbar={(table) => (
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={table.getColumn("order").getFilterValue() ?? ""}
            onChange={(e) => table.getColumn("order").setFilterValue(e.target.value)}
            placeholder="Search order #, name or email..."
            className="h-8 pl-8 text-xs"
            aria-label="Search orders in this period"
          />
        </div>
      )}
    />
  );
}
