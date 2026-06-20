"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/ui/Badge";
import { formatPrice } from "@/shared/utils/formatPrice";
import type { Flight, FlightFilters, TimeRange } from "@/shared/types";
import { TIME_RANGE_LABELS } from "@/shared/types";

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
  className?: string;
};

// ─── Collapsible Section ───────────────────────────────────

type SectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterSection({ title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between py-3.5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <svg
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19 9-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 pb-0 opacity-0",
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
  icon?: React.ReactNode;
};

function CheckboxItem({
  label,
  checked,
  onChange,
  count,
  icon,
}: CheckboxItemProps) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500"
      />
      {icon}
      <span className="flex-1 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400 tabular-nums">{count}</span>
      )}
    </label>
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
};

function getAirlinesInfo(flights: Flight[]): AirlineInfo[] {
  const map = new Map<string, AirlineInfo>();
  for (const flight of flights) {
    const airline = flight.segments[0]?.airline;
    if (!airline) continue;
    const existing = map.get(airline.code);
    if (existing) {
      existing.count++;
    } else {
      map.set(airline.code, {
        code: airline.code,
        name: airline.name,
        logo: airline.logo,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
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
  className,
}: FilterPanelProps) {
  const stopsCounts = useMemo(() => getStopsCounts(flights), [flights]);
  const airlinesInfo = useMemo(() => getAirlinesInfo(flights), [flights]);
  const [priceMin, priceMax] = useMemo(() => getPriceRange(flights), [flights]);

  // Current price range for the slider
  const currentMin = filters.priceRange?.[0] ?? priceMin;
  const currentMax = filters.priceRange?.[1] ?? priceMax;

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
    checked: boolean,
  ) {
    const current = filters[key];
    const next = checked
      ? [...current, range]
      : current.filter((r) => r !== range);
    onChange(key, next);
  }

  const timeRanges: TimeRange[] = ["morning", "afternoon", "evening"];

  return (
    <div
      className={cn("rounded-xl border border-gray-200 bg-white", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="info" size="sm">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
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
        <FilterSection title="Price Range">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {formatPrice(currentMin)}
              </span>
              <span className="font-medium text-gray-700">
                {formatPrice(currentMax)}
              </span>
            </div>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              value={currentMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange("priceRange", [priceMin, val]);
              }}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary-500"
              aria-label="Maximum price"
            />
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{formatPrice(priceMin)}</span>
              <span>{formatPrice(priceMax)}</span>
            </div>
          </div>
        </FilterSection>

        {/* Airlines */}
        <FilterSection title="Airlines">
          <div className="flex flex-col">
            {airlinesInfo.map((airline) => (
              <CheckboxItem
                key={airline.code}
                label={airline.name}
                checked={filters.airlines.includes(airline.code)}
                onChange={(checked) => toggleAirline(airline.code, checked)}
                count={airline.count}
                icon={
                  <Image
                    src={airline.logo}
                    alt={airline.name}
                    width={20}
                    height={20}
                    className="rounded-sm"
                  />
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Departure Time */}
        <FilterSection title="Departure Time">
          <div className="flex flex-col">
            {timeRanges.map((range) => (
              <CheckboxItem
                key={range}
                label={TIME_RANGE_LABELS[range]}
                checked={filters.departureTimeRanges.includes(range)}
                onChange={(checked) =>
                  toggleTimeRange("departureTimeRanges", range, checked)
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Arrival Time */}
        <FilterSection title="Arrival Time" defaultOpen={false}>
          <div className="flex flex-col">
            {timeRanges.map((range) => (
              <CheckboxItem
                key={range}
                label={TIME_RANGE_LABELS[range]}
                checked={filters.arrivalTimeRanges.includes(range)}
                onChange={(checked) =>
                  toggleTimeRange("arrivalTimeRanges", range, checked)
                }
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
