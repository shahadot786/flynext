"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { formatPrice } from "@/shared/utils/formatPrice";
import { cn } from "@/shared/utils/cn";
import type { Flight } from "@/shared/types";

type AirlineComparisonStripProps = {
  flights: Flight[]; // all unfiltered flights to find minimum prices
  selectedAirlines: string[]; // currently filtered airlines
  onToggleAirline: (code: string) => void;
};

export function AirlineComparisonStrip({
  flights,
  selectedAirlines,
  onToggleAirline,
}: AirlineComparisonStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group flights by airline and find the lowest price for each
  const airlineFares = useMemo(() => {
    const faresMap: Record<
      string,
      {
        logo: string;
        name: string;
        code: string;
        minPrice: number;
        currency: string;
      }
    > = {};

    flights.forEach((flight) => {
      const segment = flight.segments[0];
      if (!segment) return;
      const airline = segment.airline;
      const code = airline.code;

      if (!faresMap[code] || flight.price.amount < faresMap[code].minPrice) {
        faresMap[code] = {
          logo: airline.logo,
          name: airline.name,
          code: code,
          minPrice: flight.price.amount,
          currency: flight.price.currency,
        };
      }
    });

    return Object.values(faresMap).sort((a, b) => a.minPrice - b.minPrice);
  }, [flights]);

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 240;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (airlineFares.length === 0) return null;

  return (
    <div className="relative flex items-center bg-white border border-gray-100 rounded-xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] group mb-4">
      {/* Left scroll arrow */}
      <button
        type="button"
        onClick={() => handleScroll("left")}
        className="absolute left-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Scroll left"
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

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto gap-3.5 px-6 no-scrollbar scroll-smooth"
      >
        {airlineFares.map((item) => {
          const isSelected = selectedAirlines.includes(item.code);
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => onToggleAirline(item.code)}
              className={cn(
                "flex items-center gap-2.5 shrink-0 px-4 py-2 border rounded-lg transition-all text-left cursor-pointer min-w-32.5 hover:shadow-sm",
                isSelected
                  ? "border-primary-500 bg-primary-50/40 ring-1 ring-primary-500"
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <div className="relative h-6 w-6 shrink-0">
                <Image
                  src={item.logo}
                  alt={item.name}
                  fill
                  className="object-contain rounded"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-gray-400 leading-none">
                  {item.code} <span className="font-normal">·</span>
                </p>
                <p className="text-xs font-bold text-gray-700 mt-1 leading-none truncate">
                  {formatPrice(item.minPrice, item.currency)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right scroll arrow */}
      <button
        type="button"
        onClick={() => handleScroll("right")}
        className="absolute right-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Scroll right"
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
  );
}
