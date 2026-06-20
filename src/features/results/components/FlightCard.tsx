"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { formatPrice } from "@/shared/utils/formatPrice";
import { formatDuration } from "@/shared/utils/formatDuration";
import { formatTime, formatDateShort } from "@/shared/utils/formatDate";
import type { Flight } from "@/shared/types";

// ─── Props ─────────────────────────────────────────────────

type FlightCardProps = {
  flight: Flight;
  onSelect: (flight: Flight) => void;
  index: number;
  isHighlighted?: boolean;
};

// ─── Cabin Label Map ───────────────────────────────────────

const CABIN_LABELS: Record<string, string> = {
  economy: "Economy",
  "premium-economy": "Premium",
  business: "Business",
  first: "First",
};

// ─── Stops Label ───────────────────────────────────────────

function getStopsLabel(count: number): string {
  if (count === 0) return "Non-stop";
  if (count === 1) return "1 stop";
  return `${count} stops`;
}

// ─── Component ─────────────────────────────────────────────

export const FlightCard = memo(function FlightCard({
  flight,
  onSelect,
  index,
  isHighlighted = false,
}: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  if (!firstSegment || !lastSegment) return null;

  const airline = firstSegment.airline;
  const departureTime = formatTime(firstSegment.departure.time);
  const arrivalTime = formatTime(lastSegment.arrival.time);
  const departureCode = firstSegment.departure.airport.code;
  const arrivalCode = lastSegment.arrival.airport.code;
  const stopsCount = flight.stops.length;
  const duration = formatDuration(flight.totalDurationMinutes);
  const price = formatPrice(flight.price.amount, flight.price.currency);
  const cabinLabel = CABIN_LABELS[flight.cabin] ?? flight.cabin;
  const isLowSeats = flight.seatsAvailable <= 5;

  // Check if arrival is the next day
  const depDate = new Date(firstSegment.departure.time).toDateString();
  const arrDate = new Date(lastSegment.arrival.time).toDateString();
  const isNextDay = depDate !== arrDate;

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300",
        isHighlighted
          ? "border-primary-400 ring-2 ring-primary-100"
          : "border-gray-200 hover:border-primary-200",
      )}
      aria-label={`${airline.name} flight ${firstSegment.flightNumber} from ${departureCode} to ${arrivalCode}`}
    >
      <div className="p-4 sm:p-5">
        {/* ── Desktop Layout ────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-5">
          {/* Airline Info */}
          <div className="flex items-center gap-3 w-40 shrink-0">
            <Image
              src={airline.logo}
              alt={airline.name}
              width={36}
              height={36}
              priority={index < 3}
              className="rounded-md"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {airline.name}
              </p>
              <p className="text-xs text-gray-400">
                {firstSegment.flightNumber}
              </p>
            </div>
          </div>

          {/* Flight Path */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            {/* Departure */}
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-gray-900">{departureTime}</p>
              <p className="text-xs text-gray-500 font-medium">
                {departureCode}
              </p>
            </div>

            {/* Path Visualization */}
            <div className="flex-1 flex flex-col items-center gap-1 px-2">
              <p
                className={cn(
                  "text-xs font-medium",
                  stopsCount === 0 ? "text-success" : "text-gray-500",
                )}
              >
                {getStopsLabel(stopsCount)}
              </p>
              <div className="w-full flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                <div className="flex-1 h-px bg-gray-300 relative mx-1">
                  {stopsCount > 0 &&
                    Array.from({ length: Math.min(stopsCount, 3) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-amber-400 border-2 border-white shadow-sm"
                          style={{
                            left: `${((i + 1) / (stopsCount + 1)) * 100}%`,
                          }}
                        />
                      ),
                    )}
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
              </div>
              <p className="text-xs text-gray-400">{duration}</p>
            </div>

            {/* Arrival */}
            <div className="shrink-0">
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-bold text-gray-900">{arrivalTime}</p>
                {isNextDay && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
                    +1
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium">{arrivalCode}</p>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex flex-col items-end gap-1.5 w-35 shrink-0">
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">{price}</p>
              <p className="text-xs text-gray-400">/person</p>
            </div>
            <Badge
              variant={flight.cabin === "economy" ? "neutral" : "info"}
              size="sm"
            >
              {cabinLabel}
            </Badge>
            {isLowSeats && (
              <p className="text-xs font-medium text-amber-600">
                Only {flight.seatsAvailable} seat
                {flight.seatsAvailable !== 1 ? "s" : ""} left!
              </p>
            )}
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelect(flight)}
              className="mt-1 w-full cursor-pointer"
            >
              Select
            </Button>
          </div>
        </div>

        {/* ── Mobile Layout ─────────────────────────────── */}
        <div className="flex sm:hidden flex-col gap-3">
          {/* Top: Airline + Cabin Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src={airline.logo}
                alt={airline.name}
                width={28}
                height={28}
                priority={index < 3}
                className="rounded"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {airline.name}
                </p>
                <p className="text-xs text-gray-400">
                  {firstSegment.flightNumber}
                </p>
              </div>
            </div>
            <Badge
              variant={flight.cabin === "economy" ? "neutral" : "info"}
              size="sm"
            >
              {cabinLabel}
            </Badge>
          </div>

          {/* Middle: Flight Path */}
          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-base font-bold text-gray-900">
                {departureTime}
              </p>
              <p className="text-xs text-gray-500">{departureCode}</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-0.5">
              <p
                className={cn(
                  "text-[10px] font-medium",
                  stopsCount === 0 ? "text-success" : "text-gray-500",
                )}
              >
                {getStopsLabel(stopsCount)}
              </p>
              <div className="w-full flex items-center">
                <div className="h-1 w-1 rounded-full bg-gray-400" />
                <div className="flex-1 h-px bg-gray-300 mx-0.5" />
                <div className="h-1 w-1 rounded-full bg-primary-500" />
              </div>
              <p className="text-[10px] text-gray-400">{duration}</p>
            </div>

            <div className="text-right">
              <div className="flex items-baseline gap-0.5 justify-end">
                <p className="text-base font-bold text-gray-900">
                  {arrivalTime}
                </p>
                {isNextDay && (
                  <span className="text-[9px] font-bold text-amber-600">
                    +1
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{arrivalCode}</p>
            </div>
          </div>

          {/* Bottom: Price + Select */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-lg font-bold text-primary-600">{price}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-400">/person</p>
                {isLowSeats && (
                  <p className="text-xs font-medium text-amber-600">
                    {flight.seatsAvailable} left
                  </p>
                )}
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelect(flight)}
              className="cursor-pointer"
            >
              Select
            </Button>
          </div>
        </div>
      </div>

      {/* ── Expandable Flight Details Toggle ───────────── */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-100 text-xs font-medium text-primary-600 hover:bg-primary-50/40 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={`flight-details-${flight.id}`}
      >
        <span>{isExpanded ? "Hide" : "View"} flight details</span>
        <svg
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isExpanded && "rotate-180",
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

      {/* ── Expandable Flight Details Panel ─────────────── */}
      {isExpanded && (
        <div
          id={`flight-details-${flight.id}`}
          className="border-t border-gray-100 bg-gray-50/60 px-4 sm:px-6 py-4 rounded-b-xl animate-fade-in"
        >
          <div className="space-y-0">
            {flight.segments.map((segment, segIndex) => {
              const segDep = formatTime(segment.departure.time);
              const segArr = formatTime(segment.arrival.time);
              const segDepDate = formatDateShort(segment.departure.time);
              const segDuration = formatDuration(segment.durationMinutes);
              const layover = flight.stops[segIndex];

              return (
                <div key={segment.flightNumber}>
                  {/* Segment Row */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary-500 border-2 border-primary-100" />
                      <div className="w-px flex-1 bg-gray-300 min-h-12" />
                      <div className="h-2.5 w-2.5 rounded-full bg-primary-500 border-2 border-primary-100" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {/* Departure */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">
                          {segDep}
                        </span>
                        <span className="text-xs text-gray-500">
                          {segment.departure.airport.code} —{" "}
                          {segment.departure.airport.city}
                        </span>
                        <span className="text-xs text-gray-400">
                          {segDepDate}
                        </span>
                      </div>

                      {/* Flight info */}
                      <div className="flex items-center gap-2 my-2 pl-1">
                        <Image
                          src={segment.airline.logo}
                          alt={segment.airline.name}
                          width={16}
                          height={16}
                          className="rounded-sm"
                        />
                        <span className="text-xs text-gray-500">
                          {segment.airline.name} · {segment.flightNumber} ·{" "}
                          {segDuration}
                        </span>
                      </div>

                      {/* Arrival */}
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">
                          {segArr}
                        </span>
                        <span className="text-xs text-gray-500">
                          {segment.arrival.airport.code} —{" "}
                          {segment.arrival.airport.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Layover indicator */}
                  {layover && (
                    <div className="flex items-center gap-3 sm:gap-4 my-2">
                      <div className="flex flex-col items-center">
                        <div className="w-px h-2 bg-transparent" />
                      </div>
                      <div className="flex-1 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                        <svg
                          className="h-3.5 w-3.5 text-amber-500 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-amber-700">
                          {formatDuration(layover.durationMinutes)} layover in{" "}
                          {layover.airport.city} ({layover.airport.code})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hover ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl ring-2 pointer-events-none transition-opacity",
          isHighlighted
            ? "ring-primary-400 opacity-100"
            : "ring-primary-500 opacity-0 group-hover:opacity-100",
        )}
      />
    </article>
  );
});
