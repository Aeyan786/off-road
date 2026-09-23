import { Boxes, CircleDollarSign, Package, PackageCheck, PackagePlus, PackageX, TrendingDown, TriangleAlert } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import { PeriodPicker, RankedBars, StockStatusBar } from "@/components/admin/reports/ReportPieces";
import InventoryTable from "@/components/admin/reports/InventoryTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryReport } from "@/lib/data/reports";
import { resolvePeriod } from "@/lib/reports/period";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Inventory Reports",
};

export default async function InventoryReportPage({ searchParams }) {
  const params = await searchParams;
  const period = resolvePeriod(params?.period, params?.date);

  let report = null;
  let setupError = null;
  try {
    report = await getInventoryReport(period);
  } catch (err) {
    setupError = err.message;
  }
  const t = report?.totals;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Reports" }, { label: "Inventory" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Inventory Reports</h1>
        <p className="text-sm text-neutral-500">
          Stock levels and value are <strong className="font-medium text-neutral-700">as of now</strong>{" "}
          (stock history isn&apos;t recorded). The period controls the movement figures —
          units sold, products added and days of stock left — taken from paid orders (UK time).
        </p>
      </div>

      <PeriodPicker basePath="/admin/reports/inventory" period={period} />

      {setupError ? <SetupRequiredBanner message={setupError} /> : null}

      {report ? (
        <>
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current stock</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard title="Products" value={t.products} hint={`${t.active} active · ${t.products - t.active} draft`} icon={Package} />
              <StatCard title="In Stock" value={t.inStock} hint={`More than ${report.threshold} units`} icon={PackageCheck} />
              <StatCard title="Low Stock" value={t.lowStock} hint={`1–${report.threshold} units left`} icon={TriangleAlert} tone={t.lowStock ? "warning" : "default"} />
              <StatCard title="Out of Stock" value={t.outOfStock} hint="0 units" icon={PackageX} tone={t.outOfStock ? "danger" : "default"} />
              <StatCard title="Units on Hand" value={t.units.toLocaleString("en-GB")} hint="Across all products" icon={Boxes} />
              <StatCard title="Stock Value" value={formatPrice(t.value)} hint="At current selling price" icon={CircleDollarSign} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Movement · {period.label}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard title="Units Sold" value={t.unitsSold} hint="From paid, non-cancelled orders" icon={TrendingDown} />
              <StatCard title="Products Sold" value={t.productsSold} hint={`${t.products ? Math.round((t.productsSold / t.products) * 100) : 0}% of the catalogue`} icon={PackageCheck} />
              <StatCard title="Products Added" value={t.productsAdded} hint="Created in this period" icon={PackagePlus} />
            </div>
          </section>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Stock status</CardTitle>
              <CardDescription>{t.products} products</CardDescription>
            </CardHeader>
            <CardContent>
              <StockStatusBar counts={{ in: t.inStock, low: t.lowStock, out: t.outOfStock }} threshold={report.threshold} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-base">Stock value by category</CardTitle>
                <CardDescription>Top-level category, at current selling price</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={report.byCategory}
                  value={(r) => r.value}
                  format={formatPrice}
                  detail={(r) => `${r.products} products · ${r.units.toLocaleString("en-GB")} units · ${r.low} low · ${r.out} out · ${r.sold} sold`}
                />
              </CardContent>
            </Card>
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-base">Stock value by supplier</CardTitle>
                <CardDescription>At current selling price</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={report.bySupplier}
                  value={(r) => r.value}
                  format={formatPrice}
                  detail={(r) => `${r.products} products · ${r.units.toLocaleString("en-GB")} units · ${r.low} low · ${r.out} out · ${r.sold} sold`}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-base">Products</CardTitle>
              <CardDescription>Sold and days of stock left are based on {period.label}.</CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable rows={report.rows} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
