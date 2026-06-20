import type { Flight, SortOption } from "@/shared/types";

// ─── Sort Comparators ──────────────────────────────────────
// Each returns a standard compare result: negative, zero, or positive.

function compareByPrice(a: Flight, b: Flight): number {
  return a.price.amount - b.price.amount;
}

function compareByDuration(a: Flight, b: Flight): number {
  return a.totalDurationMinutes - b.totalDurationMinutes;
}

function compareByDeparture(a: Flight, b: Flight): number {
  const timeA = a.segments[0]?.departure?.time ?? "";
  const timeB = b.segments[0]?.departure?.time ?? "";
  return new Date(timeA).getTime() - new Date(timeB).getTime();
}

// ─── Comparator Map ────────────────────────────────────────

const SORT_COMPARATORS: Record<SortOption, (a: Flight, b: Flight) => number> = {
  price_asc: (a, b) => compareByPrice(a, b),
  price_desc: (a, b) => compareByPrice(b, a),
  duration_asc: (a, b) => compareByDuration(a, b),
  departure_asc: (a, b) => compareByDeparture(a, b),
  departure_desc: (a, b) => compareByDeparture(b, a),
};

// ─── Main Sort Function ────────────────────────────────────

/**
 * Sorts an array of flights by the given sort option.
 * Returns a new sorted array — does not mutate the input.
 *
 * This is a pure function — safe to call in useMemo.
 */
export function sortFlights(
  flights: Flight[],
  sortOption: SortOption,
): Flight[] {
  const comparator = SORT_COMPARATORS[sortOption];
  return [...flights].sort(comparator);
}

// ─── Utility Exports ───────────────────────────────────────
// Exported for direct unit testing of individual comparators.

export const _testExports = {
  compareByPrice,
  compareByDuration,
  compareByDeparture,
};
