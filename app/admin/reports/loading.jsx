import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartCardSkeleton,
  RankedBarsCardsSkeleton,
  StatCardsSkeleton,
} from "@/components/states/Skeletons";

/** Mirrors the reports pages: period picker, stat cards, chart, ranked lists. */
export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-48" />
      </div>

      <StatCardsSkeleton count={4} />
      <ChartCardSkeleton />
      <RankedBarsCardsSkeleton />
    </div>
  );
}
