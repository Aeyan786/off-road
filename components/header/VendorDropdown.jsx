"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Vendor filter derived from suppliers actually present on products. Each
 * item opens the catalog with that supplier pre-selected (?supplier=...).
 */
export default function VendorDropdown({ suppliers = [] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex shrink-0 cursor-pointer items-center gap-1 px-3 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            All Vendors
            <ChevronDown className="size-3.5" />
          </button>
        }
      />
      <DropdownMenuContent align="start">
        <DropdownMenuItem render={<Link href="/products" />}>All Vendors</DropdownMenuItem>
        {suppliers.map((supplier) => (
          <DropdownMenuItem
            key={supplier}
            render={<Link href={`/products?${new URLSearchParams({ supplier })}`} />}
          >
            {supplier}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
