import { Ban, CircleDollarSign, Package, Receipt, ShoppingCart } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import ColumnChart from "@/components/admin/reports/ColumnChart";
import { ChangeHint, PeriodPicker, RankedBars } from "@/components/admin/reports/ReportPieces";
import SalesOrdersTable from "@/components/admin/reports/SalesOrdersTable";
import { OrderStatusBadge } from "@/components/admin/orders/StatusBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalesReport } from "@/lib/data/reports";
import { resolvePeriod } from "@/lib/reports/period";
import { ORDER_STATUSES } from "@/lib/order-status";
import { shippingCountry } from "@/lib/shipping-countries";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Sales Reports",
};


export default async function SalesReportPage({ searchParams }) {
  const params = await searchParams;
  const period = resolvePeriod(params?.period, params?.date);

  let report = null;
  let setupError = null;
  try {
    report = await getSalesReport(period);
  } catch (err) {
    setupError = err.message;
  }

  const bucketWord = { day: "hour", week: "day", month: "day", year: "month" }[period.type];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Reports" }, { label: "Sales" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Sales Reports</h1>
        <p className="text-sm text-neutral-500">
          Paid orders by the date payment was confirmed (UK time). Cancelled orders are
          excluded from revenue and shown separately.
        </p>
      </div>

      <PeriodPicker basePath="/admin/reports/sales" period={period} />

      {setupError ? <SetupRequiredBanner message={setupError} migration="0009_orders_checkout.sql" /> : null}

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard title="Revenue" value={formatPrice(report.totals.revenue)} hint={<ChangeHint change={report.changes.revenue} previousLabel={period.previous.label} />} icon={CircleDollarSign} />
            <StatCard title="Orders" value={report.totals.orders} hint={<ChangeHint change={report.changes.orders} previousLabel={period.previous.label} />} icon={ShoppingCart} />
            <StatCard title="Items Sold" value={report.totals.items} hint={<ChangeHint change={report.changes.items} previousLabel={period.previous.label} />} icon={Package} />
            <StatCard title="Avg. Order Value" value={formatPrice(report.totals.averageOrderValue)} hint={<ChangeHint change={report.changes.averageOrderValue} previousLabel={period.previous.label} />} icon={Receipt} />
            <StatCard
              title="Cancelled"
              value={report.totals.cancelledOrders}
              hint={report.totals.cancelledOrders ? `${formatPrice(report.totals.cancelledValue)} not counted` : "None this period"}
              icon={Ban}
              tone={report.totals.cancelledOrders ? "warning" : "default"}
            />
          </div>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Revenue by {bucketWord}</CardTitle>
              <CardDescription>{period.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColumnChart
                data={report.series.map((b) => ({
                  key: b.key,
                  label: b.label,
                  short: b.short,
                  value: b.revenue,
                  detail: `${b.orders} order${b.orders === 1 ? "" : "s"} · ${b.items} item${b.items === 1 ? "" : "s"}`,
                }))}
                format="currency"
                emptyText="No paid orders in this period."
              />
              <details className="group rounded-sm border">
                <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50">
                  Show chart data as a table
                </summary>
                <div className="max-h-72 overflow-auto border-t">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-neutral-50 text-neutral-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium capitalize">{bucketWord}</th>
                        <th className="px-3 py-2 text-right font-medium">Orders</th>
                        <th className="px-3 py-2 text-right font-medium">Items</th>
                        <th className="px-3 py-2 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y tabular-nums">
                      {report.series.map((b) => (
                        <tr key={b.key} className={b.orders ? "" : "text-neutral-400"}>
                          <td className="px-3 py-1.5">{b.label}</td>
                          <td className="px-3 py-1.5 text-right">{b.orders}</td>
                          <td className="px-3 py-1.5 text-right">{b.items}</td>
                          <td className="px-3 py-1.5 text-right">{formatPrice(b.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="rounded-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Top products</CardTitle>
                <CardDescription>By revenue, from what customers actually bought</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={report.topProducts.slice(0, 8)}
                  value={(r) => r.revenue}
                  format={formatPrice}
                  detail={(r) => `${r.quantity} sold${r.sku ? ` · SKU ${r.sku}` : ""}`}
                  emptyText="No products sold in this period."
                />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-sm">
                <CardHeader>
                  <CardTitle className="text-base">Orders by status</CardTitle>
                  <CardDescription>Current status of this period&apos;s orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {Object.keys(ORDER_STATUSES).map((status) => (
                      <li key={status} className="flex items-center justify-between text-sm">
                        <OrderStatusBadge status={status} />
                        <span className="font-semibold tabular-nums text-neutral-900">{report.statusCounts[status] ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-sm">
                <CardHeader>
                  <CardTitle className="text-base">Revenue by country</CardTitle>
                  <CardDescription>Shipping destination</CardDescription>
                </CardHeader>
                <CardContent>
                  <RankedBars
                    rows={report.countries.map((c) => ({ ...c, name: shippingCountry(c.code)?.name ?? c.code }))}
                    value={(r) => r.revenue}
                    format={formatPrice}
                    detail={(r) => `${r.orders} order${r.orders === 1 ? "" : "s"}`}
                    emptyText="No orders in this period."
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Orders in this period</CardTitle>
              <CardDescription>{report.orders.length} order{report.orders.length === 1 ? "" : "s"}, including cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesOrdersTable orders={report.orders} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
