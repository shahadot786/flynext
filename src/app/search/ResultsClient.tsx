"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFlightSearch } from "@/features/results/hooks/useFlightSearch";
import { useFilterSort } from "@/features/results/hooks/useFilterSort";
import { FilterPanel } from "@/features/results/components/FilterPanel";
import { SortBar } from "@/features/results/components/SortBar";
import { FlightList } from "@/features/results/components/FlightList";
import { SessionTimer } from "@/shared/components/SessionTimer";
import { SessionExpiredModal } from "@/shared/components/SessionExpiredModal";
import { AirlineComparisonStrip } from "@/features/results/components/AirlineComparisonStrip";
import { cn } from "@/shared/utils/cn";
import type {
  FlightSearchParams,
  CabinClass,
  PassengerCount,
  FlightFilters,
  SortOption,
} from "@/shared/types";
import airportsData from "@/data/airports.json";
import { ModifySearchTopSheet } from "@/features/results/components/ModifySearchTopSheet";

// ─── Airport Name Resolver ─────────────────────────────────

function getCityName(code: string): string {
  return airportsData.find((a) => a.code === code)?.city || code;
}

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

function formatHeaderDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${day} ${month}`;
}

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
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModifyOpen, setIsModifyOpen] = useState(false);

  const originCity = useMemo(() => getCityName(origin), [origin]);
  const destinationCity = useMemo(
    () => getCityName(destination),
    [destination],
  );

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
      cabin: cabin as CabinClass,
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

  const homeUrl = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (origin) queryParams.set("origin", origin);
    if (destination) queryParams.set("destination", destination);
    if (date) queryParams.set("date", date);
    if (returnDate) queryParams.set("returnDate", returnDate);
    queryParams.set("adults", adults.toString());
    queryParams.set("children", childrenCount.toString());
    queryParams.set("kids", kids.toString());
    queryParams.set("infants", infants.toString());
    queryParams.set("cabin", cabin);
    return `/?${queryParams.toString()}`;
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

  // Wrap filter and sort changes to reset to Page 1
  const handleUpdateFilter = <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K],
  ) => {
    updateFilter(key, value);
    setCurrentPage(1);
  };

  const handleSetSortOption = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    resetFilters();
    setCurrentPage(1);
  };

  // Toggle airline code in filters (used by Airline Strip)
  const handleToggleAirline = (code: string) => {
    const current = filters.airlines;
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    handleUpdateFilter("airlines", next);
  };

  // ── Pagination Logic ─────────────────────────────────────
  const itemsPerPage = 20;
  const totalFlights = filteredFlights.length;
  const totalPages = Math.ceil(totalFlights / itemsPerPage);

  const paginatedFlights = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFlights.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFlights, currentPage]);

  const totalPassengers = adults + childrenCount + kids + infants;
  const formattedCabin =
    cabin === "premium-economy"
      ? "Premium Economy"
      : cabin.charAt(0).toUpperCase() + cabin.slice(1);

  return (
    <>
      {/* Route Summary Header — Desktop */}
      <div className="hidden lg:block bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] shrink-0 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                {originCity} ({origin}) — {destinationCity} ({destination})
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{returnDate ? "Round Trip" : "One Way"}</span>
                <span>·</span>
                <span>
                  {formatHeaderDate(date)}
                  {returnDate ? ` — ${formatHeaderDate(returnDate)}` : ""}
                </span>
                <span>·</span>
                <span>
                  {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
                </span>
                <span>·</span>
                <span className="capitalize">{formattedCabin}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModifyOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 text-sm transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Modify
            </button>
          </div>
        </div>
      </div>

      {/* Route Summary Header — Mobile */}
      <div className="lg:hidden bg-[#1877f2] px-4 py-3.5 text-white flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.08)] shrink-0 w-full">
        <div className="flex items-center gap-4">
          <Link
            href={homeUrl}
            className="text-white hover:text-blue-100 transition-colors cursor-pointer select-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-base font-extrabold tracking-wide leading-none flex items-center gap-1">
              <span>{origin}</span>
              <span className="text-blue-200">→</span>
              <span>{destination}</span>
            </h1>
            <p className="text-[11px] font-semibold text-blue-100 mt-1 leading-none">
              {formatHeaderDate(date)} · {totalPassengers} Passenger
              {totalPassengers !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsModifyOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors shadow-sm cursor-pointer select-none"
          aria-label="Modify search"
        >
          <svg
            className="h-4.5 w-4.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full lg:h-full lg:flex lg:flex-col lg:overflow-hidden min-h-0 flex-1">
        {/* Mobile Session Timer Bar (full-width orange bar breaking out of padding) */}
        {!isLoading && !isError && flights.length > 0 && (
          <div className="-mx-4 sm:-mx-6 -mt-6 lg:hidden mb-3.5 shrink-0">
            <SessionTimer
              key={isLoading ? "loading" : "bar-loaded"}
              isLoading={isLoading}
              onExpire={() => setIsSessionExpired(true)}
              variant="bar"
            />
          </div>
        )}

        {/* Mobile Flights Count & Filter Button Row */}
        {!isLoading && !isError && flights.length > 0 && (
          <div className="lg:hidden flex items-center justify-between mb-4 px-1 shrink-0">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">
                {filteredFlights.length} Available Flights
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5 leading-none">
                {activeFilterCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span>
                      {activeFilterCount} Filter
                      {activeFilterCount > 1 ? "s" : ""} applied
                    </span>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-blue-500 font-bold hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </span>
                ) : (
                  <span>*VAT & Tax Included</span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm relative cursor-pointer active:bg-slate-50 transition-all select-none"
            >
              <svg
                className="h-4 w-4 text-slate-500"
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
              <span>All Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        )}

        {/* Available flights count row (Desktop only) */}
        {!isLoading && !isError && flights.length > 0 && (
          <div className="hidden lg:flex items-center justify-between pb-3 mb-2 border-b border-gray-200/60 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-800">
                {filteredFlights.length} Available Flights
              </h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3 py-1 cursor-pointer transition-colors shadow-sm"
                >
                  Clear {activeFilterCount} Filters
                </button>
              )}
            </div>
            <span className="text-xs text-gray-400 font-bold">
              *Price Includes VAT & Tax
            </span>
          </div>
        )}

        {/* Main Grid: Sidebar + Results */}
        <div className="flex-1 flex gap-6 lg:overflow-hidden min-h-0">
          {/* Filter Sidebar — Desktop: always visible, Mobile: togglable */}
          <aside className="w-70 shrink-0 hidden lg:block lg:h-full lg:overflow-y-auto pr-1 pb-10 no-scrollbar">
            <div>
              {/* Session Expiration Timer */}
              <SessionTimer
                key={isLoading ? "loading" : "loaded"}
                isLoading={isLoading}
                onExpire={() => setIsSessionExpired(true)}
              />
              {/* Filter Panel */}
              <FilterPanel
                filters={filters}
                onChange={handleUpdateFilter}
                onReset={handleResetFilters}
                flights={flights}
                activeFilterCount={activeFilterCount}
                originCity={originCity}
                destinationCity={destinationCity}
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
                  onChange={handleUpdateFilter}
                  onReset={handleResetFilters}
                  flights={flights}
                  activeFilterCount={activeFilterCount}
                  originCity={originCity}
                  destinationCity={destinationCity}
                  className="border-0 rounded-none shadow-none"
                />
              </div>
            </div>
          )}

          {/* Results Column (scrollable as a whole on desktop, with sticky SortBar) */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 lg:h-full lg:overflow-y-auto no-scrollbar min-h-0 pb-32 lg:pb-10 relative">
            {!isLoading && !isError && flights.length > 0 && (
              <>
                {/* Horizontal scroll comparison strip — Desktop only */}
                <div className="hidden lg:block">
                  <AirlineComparisonStrip
                    flights={flights}
                    selectedAirlines={filters.airlines}
                    onToggleAirline={handleToggleAirline}
                  />
                </div>

                {/* Sort Bar (Sticky at the top of the scrolling column) */}
                <SortBar
                  sortOption={sortOption}
                  onChange={handleSetSortOption}
                  flights={flights}
                  className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm py-2 px-1 border-b border-gray-100/50 shadow-sm rounded-lg"
                />
              </>
            )}

            {/* Flight List Container (flows naturally, scroll is handled by parent) */}
            <div className="flex-1 flex flex-col justify-between min-h-0">
              <div>
                {/* Flight List */}
                <FlightList
                  flights={paginatedFlights}
                  isLoading={isLoading}
                  isError={isError}
                  error={error}
                  hasActiveFilters={activeFilterCount > 0}
                  onResetFilters={handleResetFilters}
                  onRetry={() => {
                    refetch();
                  }}
                  passengerCount={passengerCount}
                />
              </div>

              {/* Pagination Controls */}
              {!isLoading && !isError && totalFlights > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-150 shrink-0 pb-24 lg:pb-0 mb-4 lg:mb-0">
                  <span className="text-xs text-gray-500 font-bold">
                    Showing{" "}
                    {Math.min(
                      totalFlights,
                      (currentPage - 1) * itemsPerPage + 1,
                    )}
                    –{Math.min(totalFlights, currentPage * itemsPerPage)} of{" "}
                    {totalFlights} flights
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Prev Page */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;
                      const isCurrent = currentPage === page;
                      return (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-extrabold transition-all cursor-pointer",
                            isCurrent
                              ? "bg-primary-500 border-primary-500 text-white shadow-sm"
                              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
                          )}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* Next Page */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed transition-all"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Forced Session Expiration Modal Overlay */}
      <SessionExpiredModal isOpen={isSessionExpired} />

      {/* Modify Search Top Sheet Overlay */}
      <ModifySearchTopSheet
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
      />
    </>
  );
}
