import { CircleDollarSign, Clock, PackageCheck, ShoppingCart } from "lucide-react";
import { getOrders } from "@/lib/data/orders";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import OrdersDataTable from "@/components/admin/orders/OrdersDataTable";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Orders | Off Road Performance",
};

export default async function OrdersPage() {
  let orders = [];
  let setupError = null;
  try {
    orders = await getOrders();
  } catch (err) {
    setupError = err.message;
  }

  const count = (status) => orders.filter((o) => o.status === status).length;
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.amount_paid), 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Orders" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500">
          Paid orders from the storefront. Ship pending orders with a tracking number,
          then mark them delivered.
        </p>
      </div>

      {setupError ? <SetupRequiredBanner message={setupError} migration="0009_orders_checkout.sql" /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Orders" value={orders.length} hint={`${count("cancelled")} cancelled`} icon={ShoppingCart} />
        <StatCard
          title="To Ship"
          value={count("pending")}
          hint="Pending — waiting for a tracking number"
          icon={Clock}
          tone={count("pending") > 0 ? "warning" : "default"}
        />
        <StatCard title="In Transit" value={count("shipped")} hint={`${count("delivered")} delivered`} icon={PackageCheck} />
        <StatCard title="Revenue" value={formatPrice(revenue)} hint="Paid, excluding cancelled orders" icon={CircleDollarSign} />
      </div>

      <OrdersDataTable orders={orders} />
    </div>
  );
}
