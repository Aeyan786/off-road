"use client";

import Image from "next/image";
import { filterFn_includesString } from "@tanstack/react-table";
import { ImageIcon, Pencil } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import DeleteBlogDialog from "@/components/admin/blogs/DeleteBlogDialog";
import { countWords, formatBlogDate } from "@/lib/blog-text";

/** Column definitions for the blogs DataTable. */
export const blogColumns = [
  {
    id: "image",
    header: "",
    enableSorting: false,
    cell: ({ row }) => {
      const image = row.original.image;
      return (
        <div className="relative size-10 overflow-hidden rounded-sm border bg-neutral-100">
          {image ? (
            <Image src={image} alt="" fill sizes="40px" className="object-cover" />
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
    accessorKey: "title",
    header: "Title",
    filterFn: filterFn_includesString,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-neutral-900">{row.original.title}</p>
        <p className="truncate text-xs text-neutral-400">/blogs/{row.original.slug}</p>
      </div>
    ),
    meta: { cellClassName: "max-w-[320px]" },
  },
  {
    id: "words",
    header: "Words",
    // Derived from the content, never stored.
    accessorFn: (row) => countWords(row.content),
    cell: ({ getValue }) => (
      <span className="tabular-nums">{getValue().toLocaleString("en-GB")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, columnId, filterValue) =>
      !filterValue || row.getValue(columnId) === filterValue,
    cell: ({ getValue }) =>
      getValue() === "published" ? (
        <Badge className="rounded-sm">Published</Badge>
      ) : (
        <Badge variant="secondary" className="rounded-sm">Draft</Badge>
      ),
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
        <ButtonLink
          href={`/admin/blogs/${row.original.id}/edit`}
          size="icon-sm"
          variant="ghost"
          aria-label={`Edit ${row.original.title}`}
          className="rounded-sm cursor-pointer"
        >
          <Pencil className="size-3.5" />
        </ButtonLink>
        <DeleteBlogDialog blog={row.original} />
      </div>
    ),
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
  },
];
