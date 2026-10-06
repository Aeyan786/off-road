import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Skeleton building blocks shared by every loading.jsx, so a placeholder
 * always matches the layout it stands in for and none of it is copy-pasted
 * per route. Each piece mirrors the real component's spacing and grid.
 */

/** Page title + supporting line, as every storefront and admin page opens. */
export function PageHeaderSkeleton({ className = "mb-8" }) {
  return (
    <div className={className}>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-4 w-44" />
    </div>
  );
}

/** One card from components/home/ProductGrid. */
export function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-square w-full rounded-sm" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-5 w-24" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

/** The catalog's filter rail: heading plus the collapsed filter rows. */
export function FilterRailSkeleton({ groups = 5 }) {
  return (
    <div className="space-y-5 px-5">
      <Skeleton className="h-5 w-16" />
      {Array.from({ length: groups }, (_, index) => (
        <div key={index} className="flex items-center justify-between gap-2 py-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="size-4 rounded-sm" />
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  );
}

/** Admin StatCard row. */
export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="rounded-sm gap-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded-sm" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Admin DataTable: toolbar, header row, body rows, pagination. */
export function TableSkeleton({ rows = 8, columns = 5 }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-8 w-24" />
      </div>

      <div className="rounded-sm border">
        <div className="flex items-center gap-4 border-b px-4 py-3">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton key={index} className="h-3 flex-1" />
          ))}
        </div>

        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
            {Array.from({ length: columns }, (_, column) => (
              <Skeleton key={column} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-48" />
      </div>
    </div>
  );
}

/** A card wrapping a bar chart, as the reports and analytics pages use. */
export function ChartCardSkeleton({ bars = 14 }) {
  return (
    <Card className="rounded-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-48" />
      </CardHeader>
      <CardContent>
        <div className="flex h-60 items-end gap-2">
          {Array.from({ length: bars }, (_, index) => (
            <Skeleton
              key={index}
              className="flex-1 rounded-t-sm"
              // Varied heights so it reads as a chart rather than a block.
              style={{ height: `${30 + ((index * 37) % 65)}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/** Two side-by-side cards holding ranked bars. */
export function RankedBarsCardsSkeleton({ cards = 2, rows = 5 }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: cards }, (_, card) => (
        <Card key={card} className="rounded-sm">
          <CardHeader className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: rows }, (_, row) => (
              <div key={row} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Whole-page placeholder for the catalog (/products, /new-arrivals), used as
 * the Suspense fallback inside those pages.
 *
 * It is deliberately NOT a route-level loading.jsx: a loading boundary above
 * /products would also wrap /products/[id], and once a response starts
 * streaming its status code is fixed — so notFound() there would answer 200
 * instead of 404. Keeping the boundary inside the page avoids that.
 */
export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[260px_1fr]">
        <div className="self-start">
          <FilterRailSkeleton />
        </div>

        <ProductGridSkeleton />
      </div>
    </div>
  );
}

/** Whole-page placeholder for the blog index, for the same reason. */
export function BlogListSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <PageHeaderSkeleton />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-sm" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
