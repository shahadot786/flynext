"use client";

import { useQuery } from "@tanstack/react-query";
import { searchFlights } from "@/shared/api/flightService";
import type { Flight, FlightSearchParams } from "@/shared/types";

// ─── Query Key Factory ────────────────────────────────────
// Centralized query key avoids typos and guarantees cache invalidation works.

export const flightQueryKeys = {
  all: ["flights"] as const,
  search: (params: FlightSearchParams) =>
    ["flights", "search", params] as const,
};

// ─── Hook Options ──────────────────────────────────────────

type UseFlightSearchOptions = {
  /** Pre-fetched flights from server component to hydrate the cache */
  initialData?: Flight[];
  /** Override default enabled behavior */
  enabled?: boolean;
};

// ─── Hook ──────────────────────────────────────────────────

/**
 * TanStack Query wrapper for flight search.
 *
 * - Caches results keyed by the full search params (changing any param refetches).
 * - staleTime / gcTime / retry configured globally in QueryProvider.
 * - Accepts optional `initialData` from a Server Component for SSR hydration.
 * - Automatically disabled when required params are missing.
 */
export function useFlightSearch(
  params: FlightSearchParams | null,
  options?: UseFlightSearchOptions,
) {
  const hasRequiredParams = Boolean(
    params?.origin && params?.destination && params?.date,
  );

  return useQuery<Flight[]>({
    queryKey: flightQueryKeys.search(
      params ?? {
        origin: "",
        destination: "",
        date: "",
        adults: 1,
        children: 0,
        kids: 0,
        infants: 0,
        cabin: "economy",
      },
    ),
    queryFn: () => {
      if (!params) throw new Error("Search params are required");
      return searchFlights(params);
    },
    enabled: hasRequiredParams && (options?.enabled ?? true),
    initialData: options?.initialData,
    // Per-query overrides (global defaults in QueryProvider cover staleTime/gcTime/retry)
    staleTime: 5 * 60 * 1000, // 5 minutes — flight prices don't change within this window
    gcTime: 30 * 60 * 1000, // 30 minutes — keep in cache for back/forward navigation
  });
}
