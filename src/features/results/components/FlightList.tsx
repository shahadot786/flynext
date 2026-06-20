"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlightCard } from "./FlightCard";
import { FlightCardSkeleton } from "./FlightCardSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { useBookingStore } from "@/store/bookingStore";
import type { Flight, PassengerCount } from "@/shared/types";

// ─── Props ─────────────────────────────────────────────────

type FlightListProps = {
  flights: Flight[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onRetry: () => void;
  passengerCount: PassengerCount;
};

// ─── Skeleton Count ────────────────────────────────────────

const SKELETON_COUNT = 5;

// ─── Component ─────────────────────────────────────────────

export const FlightList = memo(function FlightList({
  flights,
  isLoading,
  isError,
  error,
  hasActiveFilters,
  onResetFilters,
  onRetry,
  passengerCount,
}: FlightListProps) {
  const router = useRouter();

  const handleSelect = useCallback(
    (flight: Flight) => {
      useBookingStore.getState().setSelectedFlight(flight);
      useBookingStore.getState().setPassengerCount(passengerCount);
      router.push(`/booking?flightId=${flight.id}`);
    },
    [router, passengerCount],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Empty state
  if (flights.length === 0) {
    return (
      <EmptyState
        hasActiveFilters={hasActiveFilters}
        onResetFilters={onResetFilters}
      />
    );
  }

  // Results
  return (
    <div className="flex flex-col gap-4">
      {flights.map((flight, index) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          onSelect={handleSelect}
          index={index}
        />
      ))}
    </div>
  );
});
