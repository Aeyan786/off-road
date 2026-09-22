"use client";

import { Plus, RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SupplierFormDialog from "@/components/admin/suppliers/SupplierFormDialog";
import { supplierColumns } from "@/components/admin/suppliers/supplier-columns";

function Toolbar({ table }) {
  const nameColumn = table.getColumn("name");
  const hasFilters = Boolean(nameColumn.getFilterValue());

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={nameColumn.getFilterValue() ?? ""}
            onChange={(e) => nameColumn.setFilterValue(e.target.value)}
            placeholder="Filter by name..."
            className="h-8 pl-8 text-xs"
            aria-label="Filter by supplier name"
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

      <SupplierFormDialog
        trigger={
          <Button type="button" className="rounded-sm px-3 text-xs cursor-pointer">
            <Plus className="size-3.5" />
            Create Supplier
          </Button>
        }
      />
    </div>
  );
}

export default function SuppliersDataTable({ suppliers }) {
  return (
    <DataTable
      columns={supplierColumns}
      data={suppliers}
      getRowId={(supplier) => supplier.id}
      emptyMessage="No suppliers yet — create your first one."
      toolbar={(table) => <Toolbar table={table} />}
    />
  );
}
