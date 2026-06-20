"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import type { Flight, FlightFilters, TimeRange } from "@/shared/types";

// ─── Props ─────────────────────────────────────────────────

type FilterPanelProps = {
  filters: FlightFilters;
  onChange: <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K],
  ) => void;
  onReset: () => void;
  /** Unfiltered flights — used to derive available filter options */
  flights: Flight[];
  activeFilterCount: number;
  originCity: string;
  destinationCity: string;
  className?: string;
};

// ─── Collapsible Section ───────────────────────────────────

type SectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onResetSection?: () => void;
  showReset?: boolean;
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
  onResetSection,
  showReset = false,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-150 py-3.5 last:border-0">
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex flex-1 items-center justify-between text-left cursor-pointer"
          aria-expanded={isOpen}
        >
          <span className="text-sm font-bold text-gray-800">{title}</span>
        </button>
        <div className="flex items-center gap-2">
          {showReset && onResetSection && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResetSection();
              }}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <svg
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-125 mt-3 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Checkbox Item ─────────────────────────────────────────

type CheckboxItemProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  priceTag?: string;
  icon?: React.ReactNode;
};

function CheckboxItem({
  label,
  checked,
  onChange,
  count,
  priceTag,
  icon,
}: CheckboxItemProps) {
  return (
    <label className="flex items-center gap-2.5 py-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500"
      />
      {icon}
      <span className="flex-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors truncate">
        {label}
      </span>
      {priceTag ? (
        <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-500 tabular-nums">
          {priceTag}
        </span>
      ) : (
        count !== undefined && (
          <span className="text-xs text-gray-400 tabular-nums">{count}</span>
        )
      )}
    </label>
  );
}

// ─── SVGs for Schedule Slots ───────────────────────────────

function EarlyMorningIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 13a5 5 0 0 0-10 0" />
      <path d="M2 13h20" />
      <path d="M12 4v4M6.3 7.3l2.2 2.2M17.7 7.3l-2.2 2.2" />
      <path d="M8 17h8M6 20h12M9 23h6" />
    </svg>
  );
}

function MorningIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
    </svg>
  );
}

function AfternoonIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 14a5 5 0 0 0-10 0" />
      <path d="M2 14h20" />
      <path d="M6 18h12M8 21h8" />
    </svg>
  );
}

function EveningIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

// ─── Derived Data Helpers ──────────────────────────────────

function getStopsCounts(flights: Flight[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const flight of flights) {
    const stopCount = flight.stops.length;
    counts.set(stopCount, (counts.get(stopCount) ?? 0) + 1);
  }
  return counts;
}

type AirlineInfo = {
  code: string;
  name: string;
  logo: string;
  count: number;
  minPrice: number;
};

function getAirlinesInfo(flights: Flight[]): AirlineInfo[] {
  const map = new Map<string, AirlineInfo>();
  for (const flight of flights) {
    const airline = flight.segments[0]?.airline;
    if (!airline) continue;
    const existing = map.get(airline.code);
    if (existing) {
      existing.count++;
      existing.minPrice = Math.min(existing.minPrice, flight.price.amount);
    } else {
      map.set(airline.code, {
        code: airline.code,
        name: airline.name,
        logo: airline.logo,
        count: 1,
        minPrice: flight.price.amount,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.minPrice - b.minPrice);
}

function getPriceRange(flights: Flight[]): [number, number] {
  if (flights.length === 0) return [0, 100000];
  let min = Infinity;
  let max = -Infinity;
  for (const flight of flights) {
    min = Math.min(min, flight.price.amount);
    max = Math.max(max, flight.price.amount);
  }
  return [min, max];
}

// ─── Component ─────────────────────────────────────────────

export function FilterPanel({
  filters,
  onChange,
  onReset,
  flights,
  activeFilterCount,
  originCity,
  destinationCity,
  className,
}: FilterPanelProps) {
  const stopsCounts = useMemo(() => getStopsCounts(flights), [flights]);
  const airlinesInfo = useMemo(() => getAirlinesInfo(flights), [flights]);
  const [priceMin, priceMax] = useMemo(() => getPriceRange(flights), [flights]);

  // Current price range for the slider
  const currentMin = filters.priceRange?.[0] ?? priceMin;
  const currentMax = filters.priceRange?.[1] ?? priceMax;

  // Schedules Local tab state
  const [scheduleTab, setScheduleTab] = useState<"departure" | "arrival">(
    "departure",
  );

  // Airline collapse state
  const [showAllAirlines, setShowAllAirlines] = useState(false);

  const displayedAirlines = showAllAirlines
    ? airlinesInfo
    : airlinesInfo.slice(0, 5);

  // ── Stops handlers ───────────────────────────────────────
  function toggleStop(stopCount: number, checked: boolean) {
    const current = filters.stops ?? [];
    const next = checked
      ? [...current, stopCount]
      : current.filter((s) => s !== stopCount);
    onChange("stops", next.length > 0 ? next : null);
  }

  // ── Airline handlers ─────────────────────────────────────
  function toggleAirline(code: string, checked: boolean) {
    const current = filters.airlines;
    const next = checked
      ? [...current, code]
      : current.filter((c) => c !== code);
    onChange("airlines", next);
  }

  // ── Time range handlers ──────────────────────────────────
  function toggleTimeRange(
    key: "departureTimeRanges" | "arrivalTimeRanges",
    range: TimeRange,
  ) {
    const current = filters[key];
    const next = current.includes(range)
      ? current.filter((r) => r !== range)
      : [...current, range];
    onChange(key, next);
  }

  const slotList: { key: TimeRange; label: string; icon: React.ReactNode }[] = [
    { key: "early_morning", label: "12 AM-06 AM", icon: <EarlyMorningIcon /> },
    { key: "morning", label: "06 AM-12 PM", icon: <MorningIcon /> },
    { key: "afternoon", label: "12 PM-06 PM", icon: <AfternoonIcon /> },
    { key: "evening", label: "06 PM-12 AM", icon: <EveningIcon /> },
  ];

  // Helper to compute active slot text for subtitle
  const activeSlotsText = useMemo(() => {
    const targetKey =
      scheduleTab === "departure" ? "departureTimeRanges" : "arrivalTimeRanges";
    const activeKeys = filters[targetKey];
    if (activeKeys.length === 0) return "Anytime";
    return activeKeys
      .map((k) => {
        if (k === "early_morning") return "Night";
        if (k === "morning") return "Morning";
        if (k === "afternoon") return "Afternoon";
        return "Evening";
      })
      .join(", ");
  }, [filters, scheduleTab]);

  const renderSlotButton = (key: TimeRange, slot: (typeof slotList)[0]) => {
    const targetKey =
      scheduleTab === "departure" ? "departureTimeRanges" : "arrivalTimeRanges";
    const isActive = filters[targetKey].includes(key);

    return (
      <button
        type="button"
        onClick={() => toggleTimeRange(targetKey, key)}
        className={cn(
          "flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer select-none w-full h-full",
          isActive
            ? "bg-blue-50/70 text-blue-600 font-bold"
            : "bg-[#f8fafc] hover:bg-gray-100/50 text-slate-600 hover:text-slate-900",
        )}
      >
        <div
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-blue-500" : "text-slate-400",
          )}
        >
          {slot.icon}
        </div>
        <span className="text-xs font-semibold leading-none tracking-tight transition-colors">
          {slot.label}
        </span>
      </button>
    );
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="px-4">
        {/* Stops */}
        <FilterSection title="Stops">
          <div className="flex flex-col">
            {[0, 1, 2].map((stopCount) => {
              const count = stopsCounts.get(stopCount) ?? 0;
              const label =
                stopCount === 0
                  ? "Non-stop"
                  : stopCount === 1
                    ? "1 Stop"
                    : "2+ Stops";
              return (
                <CheckboxItem
                  key={stopCount}
                  label={label}
                  checked={filters.stops?.includes(stopCount) ?? false}
                  onChange={(checked) => toggleStop(stopCount, checked)}
                  count={count}
                />
              );
            })}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          showReset={filters.priceRange !== null}
          onResetSection={() => onChange("priceRange", null)}
        >
          <div className="flex flex-col gap-4">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Starts from{" "}
              <span className="font-semibold text-gray-600">
                ৳ {priceMin.toLocaleString()}
              </span>{" "}
              -{" "}
              <span className="font-semibold text-gray-600">
                ৳ {priceMax.toLocaleString()}
              </span>{" "}
              against your search. Price is a subject to change.
            </p>

            {/* Custom Double Range Slider */}
            <div className="relative w-full px-2 py-3">
              <div className="relative h-1.5 w-full bg-gray-100 rounded-full">
                <div
                  className="absolute h-full bg-primary-500 rounded-full"
                  style={{
                    left: `${((currentMin - priceMin) / (priceMax - priceMin || 1)) * 100}%`,
                    right: `${100 - ((currentMax - priceMin) / (priceMax - priceMin || 1)) * 100}%`,
                  }}
                />
              </div>
              <input
                type="range"
                min={priceMin}
                max={priceMax}
                value={currentMin}
                onChange={(e) => {
                  const val = Math.min(
                    Number(e.target.value),
                    currentMax - 1000,
                  );
                  onChange("priceRange", [val, currentMax]);
                }}
                className="absolute inset-0 pointer-events-none appearance-none z-30 w-full h-full bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:shadow-md"
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={priceMin}
                max={priceMax}
                value={currentMax}
                onChange={(e) => {
                  const val = Math.max(
                    Number(e.target.value),
                    currentMin + 1000,
                  );
                  onChange("priceRange", [currentMin, val]);
                }}
                className="absolute inset-0 pointer-events-none appearance-none z-30 w-full h-full bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:shadow-md"
                aria-label="Maximum price"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-gray-700 bg-gray-50 px-2 py-1.5 rounded-lg">
              <span>BDT {currentMin.toLocaleString()}</span>
              <span>BDT {currentMax.toLocaleString()}</span>
            </div>
          </div>
        </FilterSection>

        {/* Flight Schedules */}
        <FilterSection
          title="Flight Schedules"
          showReset={
            filters.departureTimeRanges.length > 0 ||
            filters.arrivalTimeRanges.length > 0
          }
          onResetSection={() => {
            onChange("departureTimeRanges", []);
            onChange("arrivalTimeRanges", []);
          }}
        >
          <div className="flex flex-col gap-4">
            {/* Tabs Toggle container */}
            <div className="flex w-full rounded-lg bg-[#f0f4f9] p-0.5 border border-gray-200/40">
              <button
                type="button"
                onClick={() => setScheduleTab("departure")}
                className={cn(
                  "flex-1 text-center py-2 text-xs font-bold rounded-md transition-all cursor-pointer border",
                  scheduleTab === "departure"
                    ? "bg-white text-blue-600 border-blue-200 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700 border-transparent",
                )}
              >
                Departure
              </button>
              <button
                type="button"
                onClick={() => setScheduleTab("arrival")}
                className={cn(
                  "flex-1 text-center py-2 text-xs font-bold rounded-md transition-all cursor-pointer border",
                  scheduleTab === "arrival"
                    ? "bg-white text-blue-600 border-blue-200 shadow-sm"
                    : "bg-transparent text-gray-500 hover:text-gray-700 border-transparent",
                )}
              >
                Arrival
              </button>
            </div>

            {/* City Subtitle */}
            <h5 className="text-[13px] font-extrabold text-[#1e293b]">
              {scheduleTab === "departure" ? "Departure" : "Arrival"}{" "}
              {scheduleTab === "departure" ? originCity : destinationCity}:{" "}
              {activeSlotsText}
            </h5>

            {/* Time Slot Grid (exactly matching screenshots with dividers) */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-200 bg-[#f8fafc]">
              {/* Row 1 */}
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                {renderSlotButton("early_morning", slotList[0]!)}
                {renderSlotButton("morning", slotList[1]!)}
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                {renderSlotButton("afternoon", slotList[2]!)}
                {renderSlotButton("evening", slotList[3]!)}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Airlines */}
        <FilterSection title="Airlines">
          <div className="flex flex-col">
            {displayedAirlines.map((airline) => (
              <CheckboxItem
                key={airline.code}
                label={airline.name}
                checked={filters.airlines.includes(airline.code)}
                onChange={(checked) => toggleAirline(airline.code, checked)}
                priceTag={`৳ ${airline.minPrice.toLocaleString()}`}
                icon={
                  <div className="relative h-5 w-5 shrink-0 rounded border border-gray-100 overflow-hidden bg-white">
                    <Image
                      src={airline.logo}
                      alt={airline.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                }
              />
            ))}

            {/* Show More toggle */}
            {airlinesInfo.length > 5 && (
              <button
                type="button"
                onClick={() => setShowAllAirlines((prev) => !prev)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 mt-2.5 flex items-center gap-1 cursor-pointer self-start"
              >
                <span>
                  {showAllAirlines
                    ? "Show Less"
                    : `Show ${airlinesInfo.length - 5} More`}
                </span>
                <svg
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    showAllAirlines && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19 9-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
