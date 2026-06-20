"use client";

import { useState, useMemo, useCallback } from "react";
import { filterFlights } from "../utils/filterFlights";
import { sortFlights } from "../utils/sortFlights";
import type { Flight, FlightFilters, SortOption } from "@/shared/types";
import { DEFAULT_FILTERS } from "@/shared/types";

// ─── Hook Return Type ──────────────────────────────────────

type UseFilterSortReturn = {
  /** Currently applied filters */
  filters: FlightFilters;
  /** Currently selected sort option */
  sortOption: SortOption;
  /** Filtered and sorted flight list — memoised, safe to render directly */
  filteredFlights: Flight[];
  /** Count of active (non-default) filter dimensions */
  activeFilterCount: number;

  // ── Actions ──────────────────────────────────────────────
  setFilters: (filters: FlightFilters) => void;
  /** Update a single filter dimension without replacing the entire object */
  updateFilter: <K extends keyof FlightFilters>(
    key: K,
    value: FlightFilters[K],
  ) => void;
  setSortOption: (option: SortOption) => void;
  /** Reset all filters back to defaults */
  resetFilters: () => void;
};

// ─── Active Filter Counter ─────────────────────────────────

function countActiveFilters(filters: FlightFilters): number {
  let count = 0;
  if (filters.stops !== null && filters.stops.length > 0) count++;
  if (filters.priceRange !== null) count++;
  if (filters.airlines.length > 0) count++;
  if (filters.departureTimeRanges.length > 0) count++;
  if (filters.arrivalTimeRanges.length > 0) count++;
  return count;
}

// ─── Hook ──────────────────────────────────────────────────

/**
 * Manages filter and sort state for a list of flights.
 *
 * - Filters and sorting are applied via pure functions (no side effects).
 * - Result is memoised — only recomputes when flights, filters, or sort change.
 * - Provides both bulk `setFilters` and granular `updateFilter` for ergonomic use.
 */
export function useFilterSort(flights: Flight[]): UseFilterSortReturn {
  const [filters, setFilters] = useState<FlightFilters>(DEFAULT_FILTERS);
  const [sortOption, setSortOption] = useState<SortOption>("price_asc");

  // Memoised pipeline: filter first, then sort.
  // Only recomputes when the inputs actually change.
  const filteredFlights = useMemo(
    () => sortFlights(filterFlights(flights, filters), sortOption),
    [flights, filters, sortOption],
  );

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  const updateFilter = useCallback(
    <K extends keyof FlightFilters>(key: K, value: FlightFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    sortOption,
    filteredFlights,
    activeFilterCount,
    setFilters,
    updateFilter,
    setSortOption,
    resetFilters,
  };
}
