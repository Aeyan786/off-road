"use client";

import Image from "next/image";
import Link from "next/link";
import { filterFn_includesString } from "@tanstack/react-table";
import { Image as ImageIcon, RotateCcw, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/product/ProductReviews";
import DeleteReviewDialog from "@/components/admin/reviews/DeleteReviewDialog";
import { formatBlogDate } from "@/lib/blog-text";
import { formatPrice } from "@/lib/format";

/** Columns for the reviews DataTable — product comes from the product_id join. */
const columns = [
  {
    id: "product",
    header: "Product",
    accessorFn: (r) => `${r.product?.name ?? ""} ${r.product?.sku ?? ""}`,
    filterFn: filterFn_includesString,
    cell: ({ row }) => {
      const product = row.original.product;
      return (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-sm border bg-neutral-100">
            {product?.image ? (
              <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center">
                <ImageIcon className="size-4 text-neutral-300" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            {product ? (
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="block cursor-pointer truncate text-sm font-medium text-neutral-900 hover:text-brand"
              >
                {product.name}
              </Link>
            ) : (
              <p className="text-sm font-medium text-neutral-400">Product deleted</p>
            )}
            <p className="truncate text-xs text-neutral-400">
              {product?.sku ?? "—"}
              {product ? ` · ${formatPrice(product.price)}` : ""}
            </p>
          </div>
        </div>
      );
    },
    meta: { cellClassName: "max-w-[280px]" },
  },
  {
    id: "reviewer",
    header: "Reviewer",
    accessorFn: (r) => `${r.customer_name} ${r.customer_email}`,
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="min-w-0 text-xs">
        <p className="truncate text-sm font-medium text-neutral-900">{row.original.customer_name}</p>
        <a
          href={`mailto:${row.original.customer_email}`}
          className="block cursor-pointer truncate text-neutral-500 hover:text-brand hover:underline"
        >
          {row.original.customer_email}
        </a>
      </div>
    ),
    meta: { cellClassName: "max-w-[200px]" },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Stars rating={row.original.rating} />
        <span className="text-xs tabular-nums text-neutral-500">{row.original.rating}/5</span>
      </div>
    ),
    meta: { cellClassName: "w-36" },
  },
  {
    accessorKey: "body",
    header: "Review",
    enableSorting: false,
    cell: ({ getValue }) => (
      <p className="max-w-[380px] whitespace-pre-line text-sm leading-relaxed text-neutral-700">
        {getValue()}
      </p>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Posted",
    cell: ({ getValue }) => (
      <span className="text-xs text-neutral-500">{formatBlogDate(getValue()) || "—"}</span>
    ),
    meta: { cellClassName: "w-28" },
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DeleteReviewDialog review={row.original} />
      </div>
    ),
    meta: { cellClassName: "w-12" },
  },
];

function Toolbar({ table }) {
  const product = table.getColumn("product");
  const reviewer = table.getColumn("reviewer");
  const filtered = product.getFilterValue() || reviewer.getFilterValue();

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={product.getFilterValue() ?? ""}
          onChange={(e) => product.setFilterValue(e.target.value)}
          placeholder="Search product or SKU..."
          className="h-8 pl-8 text-xs"
          aria-label="Search reviews by product"
        />
      </div>
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
        <Input
          value={reviewer.getFilterValue() ?? ""}
          onChange={(e) => reviewer.setFilterValue(e.target.value)}
          placeholder="Search reviewer name or email..."
          className="h-8 pl-8 text-xs"
          aria-label="Search reviews by reviewer"
        />
      </div>
      {filtered ? (
        <Button
          type="button"
          variant="ghost"
          className="cursor-pointer rounded-sm px-3 text-xs"
          onClick={() => table.resetColumnFilters()}
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      ) : null}
    </div>
  );
}

export default function ReviewsDataTable({ reviews }) {
  return (
    <DataTable
      columns={columns}
      data={reviews}
      getRowId={(r) => r.id}
      emptyMessage="No reviews yet — they appear here as soon as a customer posts one on a product page."
      toolbar={(table) => <Toolbar table={table} />}
    />
  );
}
