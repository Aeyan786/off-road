import { Repeat, UserPlus, Users } from "lucide-react";
import { getCustomers } from "@/lib/data/orders";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import CustomersDataTable from "@/components/admin/customers/CustomersDataTable";

export const metadata = {
  title: "Customers | Off Road Performance",
};

export default async function CustomersPage() {
  let customers = [];
  let setupError = null;
  try {
    customers = await getCustomers();
  } catch (err) {
    setupError = err.message;
  }

  const newThisMonth = customers.filter((c) => c.isNew).length;
  const repeat = customers.filter((c) => c.orderCount > 1).length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Customers" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
        <p className="text-sm text-neutral-500">
          Everyone who has placed a paid order, with their latest contact details and addresses.
        </p>
      </div>

      {setupError ? <SetupRequiredBanner message={setupError} migration="0009_orders_checkout.sql" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Customers" value={customers.length} hint="With at least one paid order" icon={Users} />
        <StatCard title="New (30 days)" value={newThisMonth} hint="First ordered in the last 30 days" icon={UserPlus} />
        <StatCard title="Repeat Customers" value={repeat} hint="More than one order" icon={Repeat} />
      </div>

      <CustomersDataTable customers={customers} />
    </div>
  );
}
