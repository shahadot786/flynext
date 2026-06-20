import type { Flight, FlightFilters, TimeRange } from "@/shared/types";
import { TIME_RANGE_HOURS } from "@/shared/types";

// ─── Individual Filter Predicates ──────────────────────────
// Each predicate returns true if the flight passes the filter.
// Extracted for unit-testing individual filter dimensions.

/**
 * Checks whether a flight matches the stops filter.
 * `null` stops filter means "show all" — no filtering applied.
 */
function matchesStops(flight: Flight, stops: number[] | null): boolean {
  if (stops === null || stops.length === 0) return true;
  return stops.includes(flight.stops.length);
}

/**
 * Checks whether a flight's price falls within the given range (inclusive).
 * `null` range means "show all" — no filtering applied.
 */
function matchesPriceRange(
  flight: Flight,
  priceRange: [number, number] | null,
): boolean {
  if (priceRange === null) return true;
  const [min, max] = priceRange;
  return flight.price.amount >= min && flight.price.amount <= max;
}

/**
 * Checks whether a flight's operating airline matches any in the allowed list.
 * Empty list means "show all airlines".
 */
function matchesAirlines(flight: Flight, airlines: string[]): boolean {
  if (airlines.length === 0) return true;
  const airlineCode = flight.segments[0]?.airline?.code;
  return airlineCode !== undefined && airlines.includes(airlineCode);
}

/**
 * Extracts the hour (0-23) from an ISO datetime string.
 */
function getHourFromISOString(isoString: string): number {
  const date = new Date(isoString);
  return date.getHours();
}

/**
 * Checks whether a time (hour) falls within any of the selected time ranges.
 * Empty ranges means "show all".
 */
function matchesTimeRanges(hour: number, ranges: TimeRange[]): boolean {
  if (ranges.length === 0) return true;
  return ranges.some((range) => {
    const [start, end] = TIME_RANGE_HOURS[range];
    return hour >= start && hour < end;
  });
}

/**
 * Checks whether a flight's departure time matches any of the selected ranges.
 */
function matchesDepartureTime(flight: Flight, ranges: TimeRange[]): boolean {
  if (ranges.length === 0) return true;
  const departureTime = flight.segments[0]?.departure?.time;
  if (!departureTime) return true;
  return matchesTimeRanges(getHourFromISOString(departureTime), ranges);
}

/**
 * Checks whether a flight's arrival time matches any of the selected ranges.
 */
function matchesArrivalTime(flight: Flight, ranges: TimeRange[]): boolean {
  if (ranges.length === 0) return true;
  const lastSegment = flight.segments[flight.segments.length - 1];
  const arrivalTime = lastSegment?.arrival?.time;
  if (!arrivalTime) return true;
  return matchesTimeRanges(getHourFromISOString(arrivalTime), ranges);
}

// ─── Main Filter Function ──────────────────────────────────

/**
 * Filters an array of flights by applying all active filter dimensions.
 * Each dimension is permissive when unset (null or empty).
 *
 * This is a pure function — no side effects, safe to call in useMemo.
 */
export function filterFlights(
  flights: Flight[],
  filters: FlightFilters,
): Flight[] {
  return flights.filter(
    (flight) =>
      matchesStops(flight, filters.stops) &&
      matchesPriceRange(flight, filters.priceRange) &&
      matchesAirlines(flight, filters.airlines) &&
      matchesDepartureTime(flight, filters.departureTimeRanges) &&
      matchesArrivalTime(flight, filters.arrivalTimeRanges),
  );
}

// ─── Utility Exports ───────────────────────────────────────
// Exported for direct unit testing of individual predicates.

export const _testExports = {
  matchesStops,
  matchesPriceRange,
  matchesAirlines,
  matchesDepartureTime,
  matchesArrivalTime,
  getHourFromISOString,
};
