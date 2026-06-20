"use client";

import { useMemo } from "react";
import { cn } from "@/shared/utils/cn";
import { formatPrice } from "@/shared/utils/formatPrice";
import type { Flight, SortOption } from "@/shared/types";

type SortBarProps = {
  sortOption: SortOption;
  onChange: (option: SortOption) => void;
  flights: Flight[]; // unfiltered flights to compute Cheap/Early/Fast
  className?: string;
};

export function SortBar({
  sortOption,
  onChange,
  flights,
  className,
}: SortBarProps) {
  // Compute best prices/times/durations for tabs
  const cheapestPrice = useMemo(() => {
    if (flights.length === 0) return null;
    return Math.min(...flights.map((f) => f.price.amount));
  }, [flights]);

  const earliestTime = useMemo(() => {
    if (flights.length === 0) return null;
    const times = flights
      .map((f) => f.segments[0]?.departure?.time)
      .filter(Boolean) as string[];
    if (times.length === 0) return null;
    const sorted = [...times].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime(),
    );
    const earliestISO = sorted[0];
    if (!earliestISO) return null;
    const date = new Date(earliestISO);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [flights]);

  const fastestDuration = useMemo(() => {
    if (flights.length === 0) return null;
    const minMin = Math.min(...flights.map((f) => f.totalDurationMinutes));
    const hours = Math.floor(minMin / 60);
    const mins = minMin % 60;
    return `${hours} Hr ${mins} Min`;
  }, [flights]);

  // Dropdown options (excluding the main 3 if we want, or keeping all)
  const dropdownOptions: { value: SortOption; label: string }[] = [
    { value: "price_asc", label: "Price (Low → High)" },
    { value: "price_desc", label: "Price (High → Low)" },
    { value: "duration_asc", label: "Duration" },
    { value: "departure_asc", label: "Departure Time" },
    { value: "departure_desc", label: "Departure (Latest)" },
    { value: "arrival_asc", label: "Arrival Time" },
    { value: "stops_asc", label: "Stops" },
  ];

  return (
    <>
      {/* Desktop Layout */}
      <div
        className={cn(
          "hidden lg:flex flex-row items-center justify-between gap-4 mb-2",
          className,
        )}
      >
        {/* Dynamic Tab bar */}
        <div className="flex-1 grid grid-cols-3 rounded-lg overflow-hidden border border-gray-200/80 bg-white p-0.5 max-w-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Cheapest Tab */}
          <button
            type="button"
            onClick={() => onChange("price_asc")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-between px-3 py-2 text-left transition-all cursor-pointer",
              sortOption === "price_asc"
                ? "bg-primary-500 text-white rounded-md font-bold"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <span className="text-xs sm:text-sm">Cheapest</span>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-semibold tabular-nums mt-0.5 sm:mt-0",
                sortOption === "price_asc" ? "text-white" : "text-primary-500",
              )}
            >
              {cheapestPrice ? formatPrice(cheapestPrice) : "—"}
            </span>
          </button>

          {/* Earliest Tab */}
          <button
            type="button"
            onClick={() => onChange("departure_asc")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-between px-3 py-2 border-x border-gray-100 text-left transition-all cursor-pointer",
              sortOption === "departure_asc"
                ? "bg-primary-500 text-white rounded-md font-bold border-transparent"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <span className="text-xs sm:text-sm">Earliest</span>
            <span
              className={cn(
                "text-[9px] sm:text-[11px] font-semibold mt-0.5 sm:mt-0",
                sortOption === "departure_asc"
                  ? "text-white/90"
                  : "text-gray-400",
              )}
            >
              {earliestTime || "—"}
            </span>
          </button>

          {/* Fastest Tab */}
          <button
            type="button"
            onClick={() => onChange("duration_asc")}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-between px-3 py-2 text-left transition-all cursor-pointer",
              sortOption === "duration_asc"
                ? "bg-primary-500 text-white rounded-md font-bold"
                : "text-gray-600 hover:bg-gray-50",
            )}
          >
            <span className="text-xs sm:text-sm">Fastest</span>
            <span
              className={cn(
                "text-[9px] sm:text-[11px] font-semibold mt-0.5 sm:mt-0",
                sortOption === "duration_asc"
                  ? "text-white/90"
                  : "text-gray-400",
              )}
            >
              {fastestDuration || "—"}
            </span>
          </button>
        </div>

        {/* Select Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <label
            htmlFor="sort-dropdown"
            className="text-xs font-semibold text-gray-500"
          >
            Sort by:
          </label>
          <select
            id="sort-dropdown"
            value={sortOption}
            onChange={(e) => onChange(e.target.value as SortOption)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-sm"
          >
            {dropdownOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile Floating Bottom Sort Bar (lg:hidden) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-1.5 flex items-center justify-between w-[92vw] max-w-sm">
        {/* Earliest Button */}
        <button
          type="button"
          onClick={() => onChange("departure_asc")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-all cursor-pointer rounded-full select-none",
            sortOption === "departure_asc"
              ? "bg-blue-500 text-white font-extrabold shadow"
              : "text-slate-600",
          )}
        >
          <span className="text-[10px] uppercase tracking-wider font-extrabold leading-none">
            Earliest
          </span>
          <span
            className={cn(
              "text-[10px] font-bold mt-1 leading-none",
              sortOption === "departure_asc" ? "text-white" : "text-slate-400",
            )}
          >
            {earliestTime || "—"}
          </span>
        </button>

        {/* Cheapest Button */}
        <button
          type="button"
          onClick={() => onChange("price_asc")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2.5 px-0.5 text-center transition-all cursor-pointer rounded-full select-none",
            sortOption === "price_asc"
              ? "bg-blue-500 text-white font-extrabold shadow"
              : "text-slate-600",
          )}
        >
          <span className="text-[11px] uppercase tracking-wider font-extrabold leading-none">
            Cheapest
          </span>
          <span
            className={cn(
              "text-[11px] font-black mt-1 leading-none",
              sortOption === "price_asc" ? "text-white" : "text-blue-500",
            )}
          >
            {cheapestPrice ? formatPrice(cheapestPrice) : "—"}
          </span>
        </button>

        {/* Fastest Button */}
        <button
          type="button"
          onClick={() => onChange("duration_asc")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 text-center transition-all cursor-pointer rounded-full select-none",
            sortOption === "duration_asc"
              ? "bg-blue-500 text-white font-extrabold shadow"
              : "text-slate-600",
          )}
        >
          <span className="text-[10px] uppercase tracking-wider font-extrabold leading-none">
            Fastest
          </span>
          <span
            className={cn(
              "text-[10px] font-bold mt-1 leading-none",
              sortOption === "duration_asc" ? "text-white" : "text-slate-400",
            )}
          >
            {fastestDuration || "—"}
          </span>
        </button>
      </div>
    </>
  );
}
