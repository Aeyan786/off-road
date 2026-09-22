import { Boxes, PackageOpen, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSuppliersWithCounts } from "@/lib/data/suppliers";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import SuppliersDataTable from "@/components/admin/suppliers/SuppliersDataTable";

export const metadata = {
  title: "Manage Suppliers | Off Road Performance",
};

export default async function ManageSuppliersPage() {
  const supabase = await createClient();

  let suppliers = [];
  let setupError = null;
  try {
    suppliers = await getSuppliersWithCounts(supabase);
  } catch (err) {
    setupError = err.message;
  }

  const linkedProducts = suppliers.reduce((total, s) => total + s.productCount, 0);
  const unused = suppliers.filter((s) => s.productCount === 0).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Suppliers" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Manage Suppliers</h1>
        <p className="text-sm text-neutral-500">
          Suppliers your products are sourced from. Renaming a supplier updates
          every product that uses it.
        </p>
      </div>

      {setupError ? (
        <SetupRequiredBanner message={setupError} migration="0007_suppliers_admin_users.sql" />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Suppliers" value={suppliers.length} hint="All suppliers on file" icon={Tag} />
        <StatCard title="Products Linked" value={linkedProducts} hint="Products with a supplier" icon={Boxes} />
        <StatCard
          title="Without Products"
          value={unused}
          hint="Safe to delete"
          icon={PackageOpen}
        />
      </div>

      <SuppliersDataTable suppliers={suppliers} />
    </div>
  );
}
