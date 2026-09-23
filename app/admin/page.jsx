import Link from "next/link";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  FolderTree,
  Images,
  Newspaper,
  Package,
  PackageX,
  PlusCircle,
  ShoppingCart,
  Tag,
  TriangleAlert,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminAccess } from "@/lib/server/adminAccess";
import { canAccessModule } from "@/lib/admin-modules";
import { getDashboard } from "@/lib/data/dashboard";
import { resolvePeriod } from "@/lib/reports/period";
import { formatPrice } from "@/lib/format";
import { formatOrderNumber } from "@/lib/order-status";
import { countryName } from "@/lib/data/analytics";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import StatCard from "@/components/admin/StatCard";
import ButtonLink from "@/components/ui/button-link";
import ColumnChart from "@/components/admin/reports/ColumnChart";
import { ChangeHint, RankedBars } from "@/components/admin/reports/ReportPieces";
import { OrderStatusBadge } from "@/components/admin/orders/StatusBadges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin Dashboard",
};

const number = (n) => Number(n ?? 0).toLocaleString("en-GB");

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});
const shortDate = (value) => (value ? dateFormatter.format(new Date(value)) : "—");

/** Quick actions, in the order an admin is most likely to want them. */
const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/products/new", icon: PlusCircle, module: "products" },
  { label: "Add Category", href: "/admin/categories", icon: FolderTree, module: "categories" },
  { label: "Add Supplier", href: "/admin/suppliers", icon: Tag, module: "suppliers" },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, module: "orders" },
  { label: "View Customers", href: "/admin/customers", icon: Users, module: "customers" },
  { label: "Create Blog", href: "/admin/blogs/new", icon: Newspaper, module: "blogs" },
  { label: "Media Library", href: "/admin/media", icon: Images, module: "media" },
  { label: "View Analytics", href: "/admin/analytics", icon: BarChart3, module: "analytics" },
];

/** Section heading with an optional link to the page that owns the data. */
function SectionHeader({ title, description, href, linkLabel }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description ? <p className="text-sm text-neutral-500">{description}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="cursor-pointer text-sm font-medium text-brand hover:underline">
          {linkLabel ?? "View all"} →
        </Link>
      ) : null}
    </div>
  );
}

function EmptyRow({ children }) {
  return <p className="py-6 text-center text-sm text-neutral-400">{children}</p>;
}

export default async function AdminDashboardPage({ searchParams }) {
  const params = await searchParams;
  const period = resolvePeriod(params?.period ?? "month", params?.date);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const access = user ? await getAdminAccess(user.id).catch(() => null) : null;
  const can = (key) => canAccessModule(access, key);

  const data = await getDashboard(period, can);
  const actions = QUICK_ACTIONS.filter((action) => can(action.module));

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Breadcrumbs />
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Your storefront at a glance — {period.label} (UK time).
        </p>
      </div>

      {/* QUICK ACTIONS */}
      {actions.length ? (
        <div className="flex flex-wrap gap-2">
          {actions.map(({ label, href, icon: Icon }) => (
            <ButtonLink
              key={href}
              href={href}
              variant="outline"
              className="cursor-pointer text-xs"
            >
              <Icon className="size-3.5" />
              {label}
            </ButtonLink>
          ))}
        </div>
      ) : null}

      {/* OVERVIEW */}
      <section className="space-y-4">
        <SectionHeader title="Overview" description="Everything on the platform right now." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.products ? (
            <StatCard
              title="Products"
              value={number(data.products.total)}
              hint={`${number(data.products.active)} active · ${number(data.products.draft)} draft`}
              icon={Package}
            />
          ) : null}
          {data.orders ? (
            <StatCard
              title="Orders"
              value={number(data.orders.total)}
              hint={`${number(data.orders.counts.pending)} pending · ${number(data.orders.counts.shipped)} shipped`}
              icon={ShoppingCart}
            />
          ) : null}
          {data.orders ? (
            <StatCard
              title="Total Revenue"
              value={formatPrice(data.orders.revenue)}
              hint="All paid orders, excluding cancelled and refunded"
              icon={CircleDollarSign}
            />
          ) : null}
          {data.customers ? (
            <StatCard
              title="Customers"
              value={number(data.customers.total)}
              hint={`${number(data.customers.newThisMonth)} new in the last 30 days`}
              icon={Users}
            />
          ) : null}
        </div>

        {data.orders ? (
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>All orders ever placed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {["pending", "shipped", "delivered", "cancelled", "refunded"].map((status) => (
                  <div key={status} className="space-y-1.5">
                    <OrderStatusBadge status={status} />
                    <p className="text-xl font-bold tabular-nums text-neutral-900">
                      {number(data.orders.counts[status])}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </section>

      {/* SALES */}
      {data.sales ? (
        <section className="space-y-4">
          <SectionHeader
            title="Sales"
            description={`Paid orders in ${period.label}`}
            href="/admin/reports/sales"
            linkLabel="Full sales report"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Revenue"
              value={formatPrice(data.sales.totals.revenue)}
              hint={<ChangeHint change={data.sales.changes.revenue} previousLabel={period.previous.label} />}
              icon={CircleDollarSign}
            />
            <StatCard
              title="Orders"
              value={number(data.sales.totals.orders)}
              hint={<ChangeHint change={data.sales.changes.orders} previousLabel={period.previous.label} />}
              icon={ShoppingCart}
            />
            <StatCard
              title="Items Sold"
              value={number(data.sales.totals.items)}
              hint={<ChangeHint change={data.sales.changes.items} previousLabel={period.previous.label} />}
              icon={Boxes}
            />
            <StatCard
              title="Avg. Order Value"
              value={formatPrice(data.sales.totals.averageOrderValue)}
              hint={<ChangeHint change={data.sales.changes.averageOrderValue} previousLabel={period.previous.label} />}
              icon={BarChart3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card className="rounded-sm xl:col-span-2">
              <CardHeader>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Per day — {period.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <ColumnChart
                  data={data.sales.series.map((b) => ({
                    key: b.key,
                    label: b.label,
                    short: b.short,
                    value: b.revenue,
                    detail: `${b.orders} order${b.orders === 1 ? "" : "s"}`,
                  }))}
                  format="currency"
                  height={200}
                  emptyText="No paid orders in this period."
                />
              </CardContent>
            </Card>

            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>By revenue this period</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={data.sales.topProducts.slice(0, 5)}
                  value={(row) => row.revenue}
                  format={formatPrice}
                  detail={(row) => `${number(row.quantity)} sold`}
                  emptyText="Nothing sold in this period yet."
                />
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {/* INVENTORY */}
      {data.inventory ? (
        <section className="space-y-4">
          <SectionHeader
            title="Inventory"
            description="Stock levels across the catalogue right now."
            href="/admin/reports/inventory"
            linkLabel="Full inventory report"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="In Stock"
              value={number(data.inventory.totals.inStock)}
              hint={`${number(data.inventory.totals.units)} units · ${formatPrice(data.inventory.totals.value)}`}
              icon={Boxes}
            />
            <StatCard
              title="Low Stock"
              value={number(data.inventory.totals.lowStock)}
              hint={`At or below ${data.inventory.threshold} units`}
              icon={TriangleAlert}
              tone="warning"
            />
            <StatCard
              title="Out of Stock"
              value={number(data.inventory.totals.outOfStock)}
              hint="Needs restocking"
              icon={PackageX}
              tone="danger"
            />
            <StatCard
              title="Units Sold"
              value={number(data.inventory.totals.unitsSold)}
              hint={`${number(data.inventory.totals.productsSold)} products sold this period`}
              icon={Package}
            />
          </div>
        </section>
      ) : null}

      {/* ANALYTICS */}
      {data.visitors ? (
        <section className="space-y-4">
          <SectionHeader
            title="Visitors"
            description={`Storefront traffic in ${period.label}`}
            href="/admin/analytics"
            linkLabel="Full analytics"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Visitors"
              value={number(data.visitors.totals.visitors)}
              hint={<ChangeHint change={data.visitors.changes.visitors} previousLabel={period.previous.label} />}
              icon={Users}
            />
            <StatCard
              title="New Visitors"
              value={number(data.visitors.totals.newVisitors)}
              hint={<ChangeHint change={data.visitors.changes.newVisitors} previousLabel={period.previous.label} />}
              icon={Users}
            />
            <StatCard
              title="Returning Visitors"
              value={number(data.visitors.totals.returningVisitors)}
              hint={<ChangeHint change={data.visitors.changes.returningVisitors} previousLabel={period.previous.label} />}
              icon={Users}
            />
            <StatCard
              title="Page Views"
              value={number(data.visitors.totals.pageViews)}
              hint={
                data.visitors.totals.visitors
                  ? `${data.visitors.totals.viewsPerVisitor.toFixed(1)} per visitor`
                  : "No visits yet"
              }
              icon={BarChart3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Unique visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={data.visitors.byCountry.slice(0, 5).map((row) => ({ ...row, name: countryName(row.key) }))}
                  value={(row) => row.visitors}
                  format={number}
                  emptyText="No visitors recorded yet."
                />
              </CardContent>
            </Card>
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle>Devices</CardTitle>
                <CardDescription>Unique visitors by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <RankedBars
                  rows={data.visitors.byDevice}
                  value={(row) => row.visitors}
                  format={number}
                  emptyText="No visitors recorded yet."
                />
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {/* RECENT ACTIVITY */}
      <section className="space-y-4">
        <SectionHeader title="Recent Activity" description="The latest across the platform." />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.orders ? (
            <Card className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Link href="/admin/orders" className="cursor-pointer text-xs text-brand hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {data.orders.recent.length ? (
                  <ul className="divide-y">
                    {data.orders.recent.map((order) => (
                      <li key={order.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                        <div className="min-w-0">
                          <Link
                            href="/admin/orders"
                            className="cursor-pointer text-sm font-medium text-neutral-900 hover:text-brand"
                          >
                            {formatOrderNumber(order.order_number)}
                          </Link>
                          <p className="truncate text-xs text-neutral-500">
                            {order.full_name} · {shortDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-medium tabular-nums text-neutral-900">
                            {formatPrice(order.total)}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyRow>No orders yet.</EmptyRow>
                )}
              </CardContent>
            </Card>
          ) : null}

          {can("products") ? (
            <Card className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Newest Products</CardTitle>
                <Link href="/admin/products" className="cursor-pointer text-xs text-brand hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {data.recent.products.length ? (
                  <ul className="divide-y">
                    {data.recent.products.map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="cursor-pointer block truncate text-sm font-medium text-neutral-900 hover:text-brand"
                          >
                            {product.product}
                          </Link>
                          <p className="truncate text-xs text-neutral-500">
                            {product.sku ?? "No SKU"} · {shortDate(product.created_at)}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-neutral-500">
                          {number(product.quantity)} in stock
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyRow>No products yet.</EmptyRow>
                )}
              </CardContent>
            </Card>
          ) : null}

          {can("customers") && data.customers ? (
            <Card className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Customers</CardTitle>
                <Link href="/admin/customers" className="cursor-pointer text-xs text-brand hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {data.customers.recent.length ? (
                  <ul className="divide-y">
                    {data.customers.recent.map((customer) => (
                      <li key={customer.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-neutral-900">{customer.full_name}</p>
                          <p className="truncate text-xs text-neutral-500">
                            {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"} ·{" "}
                            {shortDate(customer.lastOrderAt ?? customer.created_at)}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-medium tabular-nums text-neutral-900">
                          {formatPrice(customer.totalSpent)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyRow>No customers yet.</EmptyRow>
                )}
              </CardContent>
            </Card>
          ) : null}

          {can("blogs") ? (
            <Card className="rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Latest Blogs</CardTitle>
                <Link href="/admin/blogs" className="cursor-pointer text-xs text-brand hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                {data.recent.blogs.length ? (
                  <ul className="divide-y">
                    {data.recent.blogs.map((blog) => (
                      <li key={blog.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                        <div className="min-w-0">
                          <Link
                            href={`/admin/blogs/${blog.id}/edit`}
                            className="cursor-pointer block truncate text-sm font-medium text-neutral-900 hover:text-brand"
                          >
                            {blog.title}
                          </Link>
                          <p className="truncate text-xs text-neutral-500">
                            {shortDate(blog.published_at ?? blog.created_at)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-medium ${
                            blog.status === "published" ? "text-emerald-600" : "text-neutral-400"
                          }`}
                        >
                          {blog.status === "published" ? "Published" : "Draft"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyRow>No blog posts yet.</EmptyRow>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
