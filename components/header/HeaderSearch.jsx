"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductSearch } from "@/components/header/useProductSearch";

/** Desktop header search — sends the keyword to /products?q=. */
export default function HeaderSearch() {
  const { current, submit } = useProductSearch();

  return (
    <form role="search" onSubmit={submit} className="flex flex-1 items-stretch">
      <Input
        // Re-keyed so the box follows the URL (e.g. cleared by Reset).
        key={current}
        type="search"
        name="q"
        defaultValue={current}
        placeholder="Search"
        aria-label="Search products"
        className="rounded-none border-none shadow-none focus-visible:ring-0"
      />
      <Button type="submit" className="gap-1.5 rounded-none rounded-r-[5px] px-5">
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}
