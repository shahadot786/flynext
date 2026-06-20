"use client";

import { useMemo, useState } from "react";
import { useFlightSearch } from "@/features/results/hooks/useFlightSearch";
import { useFilterSort } from "@/features/results/hooks/useFilterSort";
import { FilterPanel } from "@/features/results/components/FilterPanel";
import { SortBar } from "@/features/results/components/SortBar";
import { FlightList } from "@/features/results/components/FlightList";
import { cn } from "@/shared/utils/cn";
import type {
  FlightSearchParams,
  CabinClass,
  PassengerCount,
} from "@/shared/types";

// ─── Props ─────────────────────────────────────────────────

type ResultsClientProps = {
  origin: string;
  destination: string;
  date: string;
  returnDate?: string;
  adults: number;
  childrenCount: number;
  kids: number;
  infants: number;
  cabin: string;
};

// ─── Component ─────────────────────────────────────────────

export function ResultsClient({
  origin,
  destination,
  date,
  returnDate,
  adults,
  childrenCount,
  kids,
  infants,
  cabin,
}: ResultsClientProps) {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Build search params
  const searchParams = useMemo<FlightSearchParams | null>(() => {
    if (!origin || !destination || !date) return null;
    return {
      origin,
      destination,
      date,
      returnDate,
      adults,
      children: childrenCount,
      kids,
      infants,
      cabin: cabin as CabinClass, // cast safe: value comes from URL param with a known set of values
    };
  }, [
    origin,
    destination,
    date,
    returnDate,
    adults,
    childrenCount,
    kids,
    infants,
    cabin,
  ]);

  const passengerCount = useMemo<PassengerCount>(
    () => ({
      adults,
      children: childrenCount,
      kids,
      infants,
    }),
    [adults, childrenCount, kids, infants],
  );

  // Fetch flights
  const {
    data: flights = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useFlightSearch(searchParams);

  // Filter & Sort
  const {
    filters,
    sortOption,
    filteredFlights,
    activeFilterCount,
    updateFilter,
    setSortOption,
    resetFilters,
  } = useFilterSort(flights);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid: Sidebar + Results */}
      <div className="flex gap-6">
        {/* Filter Sidebar — Desktop: always visible, Mobile: togglable */}
        <aside
          className={cn(
            "w-70 shrink-0",
            // Desktop
            "hidden lg:block",
          )}
        >
          <div className="sticky top-20">
            <FilterPanel
              filters={filters}
              onChange={updateFilter}
              onReset={resetFilters}
              flights={flights}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-[320px] max-w-[85vw] bg-white shadow-xl overflow-y-auto animate-slide-in-right">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Filters</h2>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <FilterPanel
                filters={filters}
                onChange={updateFilter}
                onReset={resetFilters}
                flights={flights}
                activeFilterCount={activeFilterCount}
                className="border-0 rounded-none"
              />
            </div>
          </div>
        )}

        {/* Results Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Sort Bar — only show when we have results and not loading */}
          {!isLoading && !isError && flights.length > 0 && (
            <SortBar
              sortOption={sortOption}
              onChange={setSortOption}
              totalResults={filteredFlights.length}
            />
          )}

          {/* Flight List */}
          <FlightList
            flights={filteredFlights}
            isLoading={isLoading}
            isError={isError}
            error={error}
            hasActiveFilters={activeFilterCount > 0}
            onResetFilters={resetFilters}
            onRetry={() => {
              refetch();
            }}
            passengerCount={passengerCount}
          />
        </div>
      </div>
    </div>
  );
}
