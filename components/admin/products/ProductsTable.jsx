import { PackageOpen, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ButtonLink from "@/components/ui/button-link";
import DeleteProductDialog from "@/components/admin/products/DeleteProductDialog";
import { categoryPath } from "@/lib/data/products";

function formatPrice(price) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(price ?? 0);
}

/** Renders products loaded from Supabase. Empty state when none exist yet. */
export default function ProductsTable({ products = [] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-56 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-neutral-400">
                  <PackageOpen className="size-8" />
                  <p className="text-sm font-medium text-neutral-600">
                    No products yet
                  </p>
                  <p className="max-w-xs text-xs text-neutral-400">
                    Add your first product or use bulk upload to import a
                    CSV / XLSX file.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="max-w-[240px] truncate font-medium">
                  {product.product}
                </TableCell>
                <TableCell className="text-neutral-500">
                  {categoryPath(product.categories) ?? "—"}
                </TableCell>
                <TableCell className="text-neutral-500">{product.sku}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ButtonLink
                      href={`/admin/products/${product.id}/edit`}
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Edit ${product.product}`}
                    >
                      <Pencil className="size-3.5" />
                    </ButtonLink>
                    <DeleteProductDialog product={product} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
