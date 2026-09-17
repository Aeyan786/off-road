"use client";

import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 20, 50, 100];

// v9 requires features (and their row-model slots) to be registered
// explicitly. Built-in sort functions are registered so columns can keep
// using `sortFn: 'auto'`; filter functions are passed directly on the
// column defs, which needs no registration.
const features = tableFeatures({
  columnFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
});

const EMPTY_DATA = [];

/**
 * Reusable data table: client-side sorting, filtering and pagination.
 *
 * @param {object[]} columns column definitions
 * @param {object[]} data
 * @param {(table: object) => React.ReactNode} [toolbar] rendered above the
 *   table and handed the table instance, so filter controls and bulk
 *   actions can drive column filters and row selection.
 * @param {string} [emptyMessage]
 * @param {(row: object) => string} [getRowId] keys row selection by a stable
 *   id, so a selection survives filtering, sorting and paging.
 */
export function DataTable({
  columns,
  data,
  toolbar,
  emptyMessage = "No results.",
  getRowId,
}) {
  const table = useTable({
    features,
    columns,
    data: data ?? EMPTY_DATA,
    getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize: 20 } },
  });

  // v9 exposes state for render reads as `table.state` (getState() is gone).
  const { pageIndex, pageSize } = table.state.pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-4">
      {toolbar ? toolbar(table) : null}

      <div className="overflow-hidden rounded-lg border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.headerClassName}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex cursor-pointer items-center gap-1 hover:text-neutral-900"
                        >
                          <table.FlexRender header={header} />
                          <ArrowUpDown
                            className={cn(
                              "size-3",
                              sorted ? "text-neutral-900" : "text-neutral-400"
                            )}
                          />
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center text-sm text-neutral-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 text-xs text-neutral-500 sm:flex-row">
        <p>
          {totalRows} row{totalRows === 1 ? "" : "s"}
          {totalRows > 0 ? ` · page ${pageIndex + 1} of ${pageCount}` : ""}
        </p>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 rounded-sm border border-neutral-300 bg-background px-1.5 text-xs outline-none focus-visible:border-ring"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-sm cursor-pointer"
              aria-label="First page"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-sm cursor-pointer"
              aria-label="Previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-sm cursor-pointer"
              aria-label="Next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-sm cursor-pointer"
              aria-label="Last page"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
