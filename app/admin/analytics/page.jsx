import { Eye, Globe2, MonitorSmartphone, UserPlus, Users, Repeat } from "lucide-react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import SetupRequiredBanner from "@/components/admin/SetupRequiredBanner";
import ColumnChart from "@/components/admin/reports/ColumnChart";
import { ChangeHint, PeriodPicker, RankedBars } from "@/components/admin/reports/ReportPieces";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getVisitorReport } from "@/lib/data/analytics";
import { resolvePeriod } from "@/lib/reports/period";

export const metadata = {
  title: "Analytics",
};

const number = (n) => n.toLocaleString("en-GB");

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const period = resolvePeriod(params?.period, params?.date);

  let report = null;
  let setupError = null;
  try {
    report = await getVisitorReport(period);
  } catch (err) {
    setupError = err.message;
  }

  const bucketWord = { day: "hour", week: "day", month: "day", year: "month" }[period.type];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumbs items={[{ label: "Analytics" }]} />
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-sm text-neutral-500">
          Storefront visitors by UK time. Visitors are counted with an anonymous cookie —
          no IP addresses are stored, and admin pages are not tracked.
        </p>
      </div>

      <PeriodPicker basePath="/admin/analytics" period={period} />

      {setupError ? (
        <SetupRequiredBanner message={setupError} migration="0012_refunds_reviews_analytics.sql" />
      ) : null}

      {report ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Visitors"
              value={number(report.totals.visitors)}
              hint={<ChangeHint change={report.changes.visitors} previousLabel={period.previous.label} />}
              icon={Users}
            />
            <StatCard
              title="New Visitors"
              value={number(report.totals.newVisitors)}
              hint={<ChangeHint change={report.changes.newVisitors} previousLabel={period.previous.label} />}
              icon={UserPlus}
            />
            <StatCard
              title="Returning Visitors"
              value={number(report.totals.returningVisitors)}
              hint={<ChangeHint change={report.changes.returningVisitors} previousLabel={period.previous.label} />}
              icon={Repeat}
            />
            <StatCard
              title="Page Views"
              value={number(report.totals.pageViews)}
              hint={
                report.totals.visitors
                  ? `${report.totals.viewsPerVisitor.toFixed(1)} per visitor`
                  : "No visits this period"
              }
              icon={Eye}
            />
          </div>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Visitors</CardTitle>
              <CardDescription>
                Unique visitors per {bucketWord} — {period.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColumnChart
                data={report.series}
                format="number"
                emptyText="No visits recorded for this period yet."
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Visitors by Country</CardTitle>
                  <CardDescription>Unique visitors, from edge geo headers</CardDescription>
                </div>
                <Globe2 className="size-4 text-brand" />
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={report.byCountry.slice(0, 10)}
                  value={(row) => row.visitors}
                  format={number}
                  detail={(row) => `${number(row.views)} page views`}
                  emptyText="No visitors recorded for this period yet."
                />
              </CardContent>
            </Card>

            <Card className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                  <CardTitle>Visitors by Device</CardTitle>
                  <CardDescription>Mobile, desktop and tablet</CardDescription>
                </div>
                <MonitorSmartphone className="size-4 text-brand" />
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={report.byDevice}
                  value={(row) => row.visitors}
                  format={number}
                  detail={(row) =>
                    report.totals.visitors
                      ? `${Math.round((row.visitors / report.totals.visitors) * 100)}% of visitors`
                      : "—"
                  }
                  emptyText="No visitors recorded for this period yet."
                />
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Most Viewed Pages</CardTitle>
              <CardDescription>Top 10 paths for {period.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <RankedBars
                rows={report.topPages}
                value={(row) => row.views}
                format={number}
                detail={(row) => `${number(row.visitors)} visitors`}
                emptyText="No page views recorded for this period yet."
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
