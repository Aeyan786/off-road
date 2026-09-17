import { Images, Package, PlusCircle, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ButtonLink from "@/components/ui/button-link";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

export const metadata = {
  title: "Admin Dashboard | Off Road Performance",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs />
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Welcome back. Manage your storefront from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Manage Products
            </CardTitle>
            <Package className="size-4 text-brand" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-500">
              Add, edit, and bulk import products.
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/admin/products" className="rounded-sm px-3 text-xs">
                <PlusCircle className="size-3.5" />
                Open
              </ButtonLink>
              <ButtonLink
                href="/admin/products?upload=1"
                variant="outline"
                className="rounded-sm px-3 text-xs"
              >
                <Upload className="size-3.5" />
                Bulk Upload
              </ButtonLink>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              Media
            </CardTitle>
            <Images className="size-4 text-brand" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-500">
              Upload images individually or import a ZIP archive.
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/admin/media" className="rounded-sm px-3 text-xs">
                <Images className="size-3.5" />
                Open Media
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
