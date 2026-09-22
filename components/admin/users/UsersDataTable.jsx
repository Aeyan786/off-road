"use client";

import { useMemo } from "react";
import { filterFn_includesString } from "@tanstack/react-table";
import { Lock, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ButtonLink from "@/components/ui/button-link";
import DeleteUserDialog from "@/components/admin/users/DeleteUserDialog";
import { formatBlogDate } from "@/lib/blog-text";

function Toolbar({ table }) {
  const nameColumn = table.getColumn("name");
  const hasFilters = Boolean(nameColumn.getFilterValue());

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={nameColumn.getFilterValue() ?? ""}
            onChange={(e) => nameColumn.setFilterValue(e.target.value)}
            placeholder="Filter by name or email..."
            className="h-8 pl-8 text-xs"
            aria-label="Filter by name or email"
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

      <ButtonLink href="/admin/users/new" className="rounded-sm px-3 text-xs cursor-pointer">
        <Plus className="size-3.5" />
        Create User
      </ButtonLink>
    </div>
  );
}

export default function UsersDataTable({ users, modules, currentUserId }) {
  const labelFor = useMemo(
    () => Object.fromEntries(modules.map((m) => [m.key, m.label])),
    [modules]
  );

  const columns = useMemo(
    () => [
      {
        id: "name",
        header: "User",
        accessorFn: (u) => `${u.fullName ?? ""} ${u.email ?? ""}`,
        filterFn: filterFn_includesString,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-medium text-neutral-900">
                {u.fullName || u.email}
                {u.id === currentUserId ? (
                  <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-neutral-500">
                    You
                  </span>
                ) : null}
              </p>
              {u.fullName ? <p className="truncate text-xs text-neutral-400">{u.email}</p> : null}
            </div>
          );
        },
        meta: { cellClassName: "max-w-[280px]" },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) =>
          row.original.isSuperAdmin ? (
            <Badge className="rounded-sm">Super admin</Badge>
          ) : (
            <Badge variant="secondary" className="rounded-sm">Staff</Badge>
          ),
      },
      {
        id: "modules",
        header: "Access",
        enableSorting: false,
        cell: ({ row }) =>
          row.original.isSuperAdmin ? (
            <span className="text-xs text-neutral-500">Everything</span>
          ) : (
            <div className="flex max-w-md flex-wrap gap-1">
              {row.original.modules.map((key) => (
                <span key={key} className="rounded-sm border px-1.5 py-0.5 text-[11px] text-neutral-600">
                  {labelFor[key] ?? key}
                </span>
              ))}
            </div>
          ),
      },
      {
        accessorKey: "lastSignInAt",
        header: "Last sign-in",
        cell: ({ getValue }) => (
          <span className="text-xs text-neutral-500">{getValue() ? formatBlogDate(getValue()) : "Never"}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          if (u.isSuperAdmin || u.id === currentUserId) {
            return (
              <span
                className="inline-flex items-center gap-1 text-xs text-neutral-400"
                title="Super admin accounts are protected"
              >
                <Lock className="size-3" />
                Protected
              </span>
            );
          }
          return (
            <div className="flex justify-end gap-1">
              <ButtonLink
                href={`/admin/users/${u.id}/edit`}
                size="icon-sm"
                variant="ghost"
                aria-label={`Edit ${u.fullName || u.email}`}
                className="rounded-sm cursor-pointer"
              >
                <Pencil className="size-3.5" />
              </ButtonLink>
              <DeleteUserDialog user={u} />
            </div>
          );
        },
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
      },
    ],
    [labelFor, currentUserId]
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowId={(u) => u.id}
      emptyMessage="No admin users match this filter."
      toolbar={(table) => <Toolbar table={table} />}
    />
  );
}
