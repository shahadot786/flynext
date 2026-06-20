import { Skeleton } from "@/shared/components/ui/Skeleton";

export function FlightCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
      data-testid="flight-skeleton"
      aria-hidden="true"
    >
      {/* Desktop Skeleton */}
      <div className="hidden sm:flex items-center gap-5">
        {/* Airline */}
        <div className="flex items-center gap-3 w-40 shrink-0">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>

        {/* Flight Path */}
        <div className="flex-1 flex items-center gap-3">
          {/* Departure */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>

          {/* Path Line */}
          <div className="flex-1 flex flex-col items-center gap-1.5 px-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Arrival */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-2 w-35 shrink-0">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="flex sm:hidden flex-col gap-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Flight path */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-7" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-2.5 w-10" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-7" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
