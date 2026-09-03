"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import BulkUploadDialog from "@/components/admin/products/BulkUploadDialog";

export default function ProductsToolbar({ initialUploadOpen = false }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [uploadOpen, setUploadOpen] = useState(initialUploadOpen);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      router.replace(`/admin/products?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <BulkUploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          trigger={
            <Button type="button" variant="outline">
              <Upload className="size-4" />
              Bulk Upload
            </Button>
          }
        />
        <ButtonLink href="/admin/products/new">
          <Plus className="size-4" />
          Add Product
        </ButtonLink>
      </div>
    </div>
  );
}
