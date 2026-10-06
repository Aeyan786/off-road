import { Skeleton } from "@/components/ui/skeleton";
import { StatCardsSkeleton, TableSkeleton } from "@/components/states/Skeletons";

/**
 * Admin fallback, matching the shape nearly every admin page shares:
 * breadcrumb, title, stat cards, data table. Pages built differently
 * (reports, analytics) have their own.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <StatCardsSkeleton count={3} />
      <TableSkeleton />
    </div>
  );
}
