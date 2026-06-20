"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { formatPrice } from "@/shared/utils/formatPrice";
import { formatDuration } from "@/shared/utils/formatDuration";
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
  first: "First Class",
};

// ─── Date/Time Format Helpers ──────────────────────────────

function formatCardDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  return `${day} ${month}, ${weekday}`;
}

function formatCardTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getStopsLabel(count: number): string {
  if (count === 0) return "Non-stop";
  if (count === 1) return "1 Stop";
  return `${count} Stops`;
}

// ─── Component ─────────────────────────────────────────────

export const FlightCard = memo(function FlightCard({
  flight,
  onSelect,
  index,
  isHighlighted = false,
}: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "baggage" | "rules" | "refund"
  >("details");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isBottomSheetClosing, setIsBottomSheetClosing] = useState(false);
  const [mobileTab, setMobileTab] = useState<
    "details" | "baggage" | "rules" | "refund"
  >("details");

  const closeBottomSheet = () => {
    setIsBottomSheetClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isBottomSheetClosing) {
      setIsBottomSheetOpen(false);
      setIsBottomSheetClosing(false);
    }
  };

  useEffect(() => {
    if (isBottomSheetOpen && !isBottomSheetClosing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isBottomSheetOpen, isBottomSheetClosing]);

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  if (!firstSegment || !lastSegment) return null;

  const airline = firstSegment.airline;
  const departureTime = formatCardTime(firstSegment.departure.time);
  const arrivalTime = formatCardTime(lastSegment.arrival.time);
  const departureDate = formatCardDate(firstSegment.departure.time);
  const arrivalDate = formatCardDate(lastSegment.arrival.time);

  const departureCode = firstSegment.departure.airport.code;
  const arrivalCode = lastSegment.arrival.airport.code;
  const departureAirport = firstSegment.departure.airport.name;
  const arrivalAirport = lastSegment.arrival.airport.name;
  const originCity = firstSegment.departure.airport.city;
  const destinationCity = lastSegment.arrival.airport.city;

  const stopsCount = flight.stops.length;
  const transitCodes = flight.stops.map((s) => s.airport.code).join(", ");
  const totalLayoverMinutes = flight.stops.reduce(
    (acc, s) => acc + s.durationMinutes,
    0,
  );
  const layoverDurationText =
    totalLayoverMinutes > 0 ? formatDuration(totalLayoverMinutes) : "";

  const duration = formatDuration(flight.totalDurationMinutes);
  const currentFare = flight.price.amount;
  const originalFare = Math.round(currentFare * 1.07); // 7% fake markup for visual strikethrough comparison
  const priceFormatted = formatPrice(currentFare, flight.price.currency);
  const originalPriceFormatted = formatPrice(
    originalFare,
    flight.price.currency,
  );

  const cabinLabel = CABIN_LABELS[flight.cabin] ?? flight.cabin;
  const isLowSeats = flight.seatsAvailable <= 5;

  // Check if arrival is next day
  const depDateObj = new Date(firstSegment.departure.time).toDateString();
  const arrDateObj = new Date(lastSegment.arrival.time).toDateString();
  const isNextDay = depDateObj !== arrDateObj;

  return (
    <article
      className={cn(
        "group relative rounded-xl border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300",
        isHighlighted
          ? "border-primary-400 ring-2 ring-primary-100/55"
          : "border-gray-200 hover:border-primary-200",
      )}
      aria-label={`${airline.name} flight ${firstSegment.flightNumber} from ${departureCode} to ${arrivalCode}`}
    >
      {/* Main Grid: Desktop layout (lg) vs Mobile layout (<lg) */}
      <div className="min-h-43.75">
        {/* ── Desktop Layout ──────────────────────────────────── */}
        <div className="hidden lg:flex flex-row min-h-43.75">
          {/* Flight Details Side */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-5">
            {/* Main info row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
              {/* 1. Airline & Route */}
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 border border-gray-100 rounded-md overflow-hidden bg-white p-0.5">
                  <Image
                    src={airline.logo}
                    alt={airline.name}
                    fill
                    priority={index < 3}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    {departureCode} - {arrivalCode}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                    {airline.name}
                  </p>
                  <p className="text-[11px] text-primary-500 font-semibold mt-0.5">
                    {duration}
                  </p>
                </div>
              </div>

              {/* 2. Departure Info */}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                  {departureTime}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {departureDate}
                </p>
                <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">
                  {departureAirport}
                </p>
              </div>

              {/* 3. Arrival Info */}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 leading-tight flex items-baseline gap-1">
                  {arrivalTime}
                  {isNextDay && (
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded shrink-0">
                      +1 day
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {arrivalDate}
                </p>
                <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">
                  {arrivalAirport}
                </p>
              </div>

              {/* 4. Stops Info */}
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-800 leading-tight">
                  {getStopsLabel(stopsCount)}
                </h4>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">
                  {transitCodes || "Direct"}
                </p>
                {stopsCount > 0 && (
                  <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                    {layoverDurationText} layover
                  </p>
                )}
              </div>
            </div>

            {/* Badges / Bottom Action line */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-gray-100">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  Partially Refundable
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  Pay Later
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  🪙 299 coins
                </span>
                {isLowSeats && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    Only {flight.seatsAvailable} seat
                    {flight.seatsAvailable !== 1 ? "s" : ""} left!
                  </span>
                )}
              </div>

              {/* View Detail Toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                <span>View Detail</span>
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
            </div>
          </div>

          {/* Pricing Column (Right side, styled like vendor box) */}
          <div className="w-full lg:w-52.5 shrink-0 bg-blue-50/20 border-t lg:border-t-0 lg:border-l border-gray-100 p-5 flex flex-col justify-center items-center lg:items-end text-center lg:text-right rounded-r-xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-extrabold text-green-600 tracking-wider">
                FLIGHTINT
              </span>
              <svg
                className="h-3 w-3 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-400 line-through leading-none mb-1">
                {originalPriceFormatted}
              </p>
              <p className="text-xl font-extrabold text-primary-600 leading-none">
                {priceFormatted}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Includes VAT & Tax
              </p>
            </div>

            <Badge
              variant={flight.cabin === "economy" ? "neutral" : "info"}
              size="sm"
              className="mb-3"
            >
              {cabinLabel}
            </Badge>

            <Button
              size="sm"
              variant="primary"
              onClick={() => onSelect(flight)}
              className="w-full sm:w-37.5 lg:w-full rounded-full cursor-pointer flex items-center justify-center gap-2 font-bold py-2 shadow-sm"
            >
              <span>Select</span>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* ── Mobile Layout ───────────────────────────────────── */}
        <div
          onClick={() => {
            setMobileTab("details");
            setIsBottomSheetOpen(true);
          }}
          className="lg:hidden p-4 flex flex-col gap-3.5 cursor-pointer bg-white active:bg-gray-50/60 transition-colors rounded-xl"
        >
          {/* 1. Top Tags Row */}
          <div className="flex items-center gap-4 text-[9px] font-bold text-gray-500">
            <span className="flex items-center gap-1 text-emerald-600">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                />
              </svg>
              Partially Refundable
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                />
              </svg>
              Pay Later
            </span>
            {isLowSeats && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/60">
                Only {flight.seatsAvailable} left!
              </span>
            )}
          </div>

          {/* 2. Timing/Stops Row (3 columns) */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
            {/* Departure */}
            <div className="text-left">
              <h4 className="text-sm font-black text-slate-800 leading-none">
                {departureTime}
              </h4>
              <p className="text-[11px] font-extrabold text-slate-700 mt-1 leading-none">
                {departureCode}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-none">
                {departureDate.split(",")[0]}
              </p>
            </div>

            {/* Path/Duration */}
            <div className="flex flex-col items-center min-w-22.5 px-1">
              <span className="text-[10px] font-extrabold text-slate-500 leading-none">
                {duration}
              </span>

              {/* Timeline Line with Logo in center */}
              <div className="relative w-full flex items-center justify-center my-1">
                <div className="absolute inset-x-0 h-0.5 bg-gray-150 rounded-full" />
                <div className="relative z-10 h-5.5 w-5.5 rounded-full border border-gray-100 bg-white overflow-hidden p-0.5">
                  <Image
                    src={airline.logo}
                    alt={airline.name}
                    fill
                    className="object-contain"
                  />
                </div>
                {/* Layovers dots if stop count > 0 */}
                {stopsCount > 0 && (
                  <>
                    <div className="absolute left-[20%] h-1 w-1 rounded-full bg-slate-400" />
                    <div className="absolute right-[20%] h-1 w-1 rounded-full bg-slate-400" />
                  </>
                )}
              </div>

              <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap leading-none">
                {getStopsLabel(stopsCount)}
                {totalLayoverMinutes > 0 && `, ${layoverDurationText}`}
              </span>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <h4 className="text-sm font-black text-slate-800 leading-none flex items-baseline justify-end gap-0.5">
                {arrivalTime}
                {isNextDay && (
                  <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-0.5 rounded shrink-0">
                    +1d
                  </span>
                )}
              </h4>
              <p className="text-[11px] font-extrabold text-slate-700 mt-1 leading-none">
                {arrivalCode}
              </p>
              <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-none">
                {arrivalDate.split(",")[0]}
              </p>
            </div>
          </div>

          {/* 3. Footer Row (Vendor, Pricing, Coins, Select button) */}
          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-0.5">
            {/* Vendor & Price */}
            <div className="text-left">
              <div className="flex items-center gap-0.5 text-[8px] font-extrabold text-green-600 uppercase tracking-wider mb-0.5">
                <svg
                  className="h-2.5 w-2.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>FLIGHTINT</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-black text-blue-600">
                  {priceFormatted}
                </span>
                <span className="text-[10px] text-gray-400 line-through font-semibold">
                  {originalPriceFormatted}
                </span>
              </div>
            </div>

            {/* Coins & Button */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-700">
                🪙{" "}
                <span className="font-extrabold text-amber-600">
                  {flight.stops.length > 0 ? "309" : "299"}
                </span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(flight);
                }}
                className="inline-flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-3.5 py-2 text-[10px] rounded-full shadow transition-all cursor-pointer select-none"
              >
                <span>Select</span>
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Details — Desktop Only */}
      {isExpanded && (
        <div className="hidden lg:block border-t border-gray-100 bg-gray-50/40 rounded-b-xl overflow-hidden">
          {/* Detailed Section Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            {(["details", "baggage", "rules", "refund"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3 text-xs font-bold transition-all border-b-2 capitalize cursor-pointer",
                  activeTab === tab
                    ? "border-primary-500 text-primary-600 bg-gray-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/30",
                )}
              >
                {tab === "details"
                  ? "Flight Details"
                  : tab === "rules"
                    ? "Fare Rules"
                    : tab}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="p-5">
            {/* 1. Flight Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-4">
                {flight.segments.map((segment, segIndex) => {
                  const segDep = formatCardTime(segment.departure.time);
                  const segArr = formatCardTime(segment.arrival.time);
                  const segDepDate = formatCardDate(segment.departure.time);
                  const segArrDate = formatCardDate(segment.arrival.time);
                  const segDuration = formatDuration(segment.durationMinutes);
                  const layover = flight.stops[segIndex];

                  return (
                    <div key={segment.flightNumber}>
                      {/* Segment breakdown */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center pt-1 shrink-0">
                          <div className="h-3.5 w-3.5 rounded-full bg-primary-500 border-2 border-white shadow" />
                          <div className="w-0.5 flex-1 bg-gray-200 min-h-12.5 my-1" />
                          <div className="h-3.5 w-3.5 rounded-full bg-primary-500 border-2 border-white shadow" />
                        </div>
                        <div className="flex-1 space-y-4">
                          {/* Dep details */}
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold text-gray-800">
                              {segDep}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                              {segment.departure.airport.city} (
                              {segment.departure.airport.code})
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {segDepDate}
                            </span>
                          </div>
                          {/* Airline & flight number */}
                          <div className="flex items-center gap-2 pl-0.5">
                            <div className="relative h-4.5 w-4.5 overflow-hidden">
                              <Image
                                src={segment.airline.logo}
                                alt={segment.airline.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {segment.airline.name} · {segment.flightNumber} ·{" "}
                              {segDuration} · {cabinLabel}
                            </span>
                          </div>
                          {/* Arr details */}
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-sm font-bold text-gray-800">
                              {segArr}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">
                              {segment.arrival.airport.city} (
                              {segment.arrival.airport.code})
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {segArrDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Layover block */}
                      {layover && (
                        <div className="my-4 flex items-center gap-2.5 rounded-lg bg-amber-50/50 border border-amber-100 px-4 py-2.5 ml-7">
                          <svg
                            className="h-4 w-4 text-amber-500 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                            />
                          </svg>
                          <span className="text-xs font-bold text-amber-800">
                            Transit layover:{" "}
                            {formatDuration(layover.durationMinutes)} in{" "}
                            {layover.airport.city} ({layover.airport.code})
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Baggage Tab */}
            {activeTab === "baggage" && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-w-lg shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                      <th className="px-4 py-3">Flight</th>
                      <th className="px-4 py-3">Cabin Baggage</th>
                      <th className="px-4 py-3">Checked Baggage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
                    {flight.segments.map((seg) => (
                      <tr key={seg.flightNumber}>
                        <td className="px-4 py-3">
                          {seg.departure.airport.code} -{" "}
                          {seg.arrival.airport.code}
                        </td>
                        <td className="px-4 py-3">
                          {flight.cabin === "economy"
                            ? "7 Kg (1 piece)"
                            : "10 Kg (1 piece)"}
                        </td>
                        <td className="px-4 py-3">
                          {flight.cabin === "economy"
                            ? "20 Kg (1 piece)"
                            : flight.cabin === "business"
                              ? "35 Kg (2 pieces)"
                              : "40 Kg (2 pieces)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Fare Rules Tab */}
            {activeTab === "rules" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl text-xs">
                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <h5 className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1.5">
                    Date Change Fee
                  </h5>
                  <ul className="space-y-1.5 text-gray-600 font-semibold">
                    <li className="flex justify-between">
                      <span>More than 72 hours:</span>
                      <span className="text-primary-500">BDT 2,500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>24 to 72 hours:</span>
                      <span className="text-primary-500">BDT 3,500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Within 24 hours:</span>
                      <span className="text-rose-500">BDT 5,000</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                  <h5 className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1.5">
                    Cancellation & Refund Fee
                  </h5>
                  <ul className="space-y-1.5 text-gray-600 font-semibold">
                    <li className="flex justify-between">
                      <span>More than 72 hours:</span>
                      <span className="text-primary-500">BDT 3,500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>24 to 72 hours:</span>
                      <span className="text-primary-500">BDT 4,500</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Within 24 hours:</span>
                      <span className="text-rose-500">Non-Refundable</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. Refund Policy Tab */}
            {activeTab === "refund" && (
              <div className="max-w-2xl text-xs space-y-3 font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
                <p>
                  1. Refunds are subject to the carrier&apos;s policy and might
                  incur a cancellation fee.
                </p>
                <p>
                  2. For refundable tickets, cancellation requests must be
                  submitted online at least 4 hours prior to flight departure.
                </p>
                <p>
                  3. The refund process takes 7-10 working days, and the amount
                  will be credited back to your original payment card.
                </p>
                <div className="flex items-center gap-2 mt-4 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-[11px] font-bold">
                  <svg
                    className="h-4 w-4 text-emerald-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  This ticket is partially refundable under standard airlines
                  rules.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Details Bottom Sheet ─────────────────────── */}
      {isBottomSheetOpen && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-32.5 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className={cn(
              "absolute inset-0 bg-black/50 transition-opacity duration-300",
              isBottomSheetClosing ? "animate-fade-out" : "animate-fade-in",
            )}
            onClick={closeBottomSheet}
          />

          {/* Panel */}
          <div
            onAnimationEnd={handleAnimationEnd}
            className={cn(
              "relative w-full bg-white rounded-t-2xl shadow-2xl flex flex-col flex-1 z-10 overflow-hidden",
              isBottomSheetClosing ? "animate-slide-down" : "animate-slide-up",
            )}
          >
            {/* Drag Handle indicator */}
            <div className="flex justify-center py-2.5 shrink-0">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-slate-800">
                  Flight Details
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/60">
                  <svg
                    className="h-3 w-3 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                    />
                  </svg>
                  Partially Refundable
                </span>
              </div>
              <button
                type="button"
                onClick={closeBottomSheet}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <svg
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-100 bg-white px-2 shrink-0 justify-between">
              {(["details", "baggage", "rules", "refund"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileTab(tab)}
                    className={cn(
                      "flex-1 text-center py-3 text-[11px] font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap",
                      mobileTab === tab
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-400 hover:text-gray-600",
                    )}
                  >
                    {tab === "details"
                      ? "Flight Details"
                      : tab === "rules"
                        ? "Fare Rules"
                        : tab === "baggage"
                          ? "Baggage"
                          : "Refund Policy"}
                  </button>
                ),
              )}
            </div>

            {/* Tab content area (scrollable, pure white) */}
            <div className="flex-1 overflow-y-auto p-4 bg-white space-y-4">
              {mobileTab === "details" && (
                <>
                  {/* Header Subtitle */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-150/60">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-extrabold text-[10px]">
                        1
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-none">
                          {originCity} → {destinationCity}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-none">
                          {departureDate} ·{" "}
                          {stopsCount === 0
                            ? "Non-stop"
                            : stopsCount === 1
                              ? "1 Stop"
                              : `${stopsCount} Stops`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500">
                      {duration}
                    </span>
                  </div>

                  {/* Warning Alerts */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100/40 p-3 text-[10px] leading-relaxed text-slate-600 font-semibold shadow-xs">
                      <svg
                        className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        This flight contains CodeShare segment, Bangladeshi
                        passport holders may require a transit visa to travel.
                        Please check the visa requirements as per your
                        nationality before purchasing this ticket.
                      </div>
                    </div>

                    {stopsCount > 0 && (
                      <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100/40 p-3 text-[10px] leading-relaxed text-slate-600 font-semibold shadow-xs">
                        <svg
                          className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <div>
                          This flight has multiple stops. Before booking, please
                          make sure you review the visa requirements for each
                          stop based on your nationality.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flight Segment details timeline */}
                  <div className="space-y-4 pt-1">
                    {flight.segments.map((segment, segIndex) => {
                      const segDep = formatCardTime(segment.departure.time);
                      const segArr = formatCardTime(segment.arrival.time);
                      const segDepDate = formatCardDate(segment.departure.time);
                      const segArrDate = formatCardDate(segment.arrival.time);
                      const segDuration = formatDuration(
                        segment.durationMinutes,
                      );
                      const layover = flight.stops[segIndex];

                      return (
                        <div key={segment.flightNumber} className="space-y-4">
                          {/* Step 1: Departure Location */}
                          <div className="flex gap-2.5">
                            <div className="flex flex-col items-center shrink-0 w-5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                  />
                                </svg>
                              </div>
                              <div className="w-0.5 flex-1 border-l border-dashed border-gray-300 min-h-7.5 my-1" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-slate-800">
                                Departure from {segment.departure.airport.city}
                              </p>
                              <div className="inline-block bg-slate-100 border border-slate-200/60 rounded px-2 py-0.5 mt-1 text-[9px] font-semibold text-slate-500 truncate max-w-full">
                                Terminal 1 : {segment.departure.airport.name}
                              </div>
                            </div>
                          </div>

                          {/* Step 2: Segment flight details */}
                          <div className="flex gap-2.5">
                            <div className="flex flex-col items-center shrink-0 w-5">
                              <div className="w-0.5 flex-1 border-l border-dashed border-gray-300 min-h-27.5" />
                            </div>
                            <div className="flex-1 pl-1 space-y-3 pb-3">
                              {/* Row 1: Airline logo, Route code, Times */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="relative h-6.5 w-6.5 shrink-0 border border-gray-100 rounded bg-white p-0.5">
                                    <Image
                                      src={segment.airline.logo}
                                      alt={segment.airline.name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <div>
                                    <h5 className="text-[10px] font-black text-slate-800 leading-none">
                                      {segment.departure.airport.code} –{" "}
                                      {segment.arrival.airport.code}
                                    </h5>
                                    <p className="text-[9px] text-slate-400 font-semibold mt-1 leading-none">
                                      {segDuration}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3.5 text-right">
                                  <div>
                                    <p className="text-[11px] font-black text-slate-800 leading-none">
                                      {segDep}
                                    </p>
                                    <p className="text-[8px] text-slate-400 font-semibold mt-1 leading-none">
                                      {segDepDate.split(",")[0]}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-[11px] font-black text-slate-800 leading-none">
                                      {segArr}
                                    </p>
                                    <p className="text-[8px] text-slate-400 font-semibold mt-1 leading-none">
                                      {segArrDate.split(",")[0]}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Row 2: Amenities icons */}
                              <div className="flex items-center gap-3.5 pt-2 text-slate-400 text-[10px]">
                                <span title="Meal included">🥤</span>
                                <span title="In-flight entertainment">📺</span>
                                <span title="Hot meal">🍽️</span>
                                <span title="Checked baggage included">🧳</span>
                                <span title="USB / Power socket">🔌</span>
                                <span title="Standard seat">💺</span>
                                <span title="Wifi onboard">📶</span>
                              </div>

                              {/* Row 3: Airline & flight details */}
                              <div className="pt-2 space-y-0.5 text-[9px] text-slate-500 font-semibold">
                                <p>
                                  {segment.airline.name} · Flight :{" "}
                                  <span className="font-extrabold text-slate-700">
                                    {segment.flightNumber}
                                  </span>
                                </p>
                                <p className="text-slate-400 font-medium">
                                  Boeing 777-300er ·{" "}
                                  <span className="text-slate-500 font-semibold">
                                    {cabinLabel}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Step 3: Layover (if applicable) */}
                          {layover && (
                            <div className="flex gap-2.5">
                              <div className="flex flex-col items-center shrink-0 w-5">
                                <div className="w-0.5 flex-1 border-l border-dashed border-gray-300 min-h-7.5 my-1" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-800">
                                  Layover at {layover.airport.city} for{" "}
                                  {formatDuration(layover.durationMinutes)}
                                </p>
                                <div className="inline-block bg-blue-50/60 border border-blue-100/40 rounded px-2.5 py-0.5 mt-1 text-[9px] font-semibold text-blue-700 truncate max-w-full">
                                  {layover.airport.name}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {mobileTab === "baggage" && (
                <div className="space-y-4">
                  {/* Baggage Table */}
                  <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-[10px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-150 text-slate-500 font-bold">
                          <th className="px-3 py-2.5">Flight</th>
                          <th className="px-3 py-2.5">Cabin Baggage</th>
                          <th className="px-3 py-2.5">Checked Baggage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-slate-700 font-semibold">
                        {flight.segments.map((seg) => (
                          <tr key={seg.flightNumber}>
                            <td className="px-3 py-2.5">
                              {seg.departure.airport.code} -{" "}
                              {seg.arrival.airport.code}
                            </td>
                            <td className="px-3 py-2.5">
                              {flight.cabin === "economy"
                                ? "7 Kg (1 piece)"
                                : "10 Kg (1 piece)"}
                            </td>
                            <td className="px-3 py-2.5">
                              {flight.cabin === "economy"
                                ? "20 Kg (1 piece)"
                                : flight.cabin === "business"
                                  ? "35 Kg (2 pieces)"
                                  : "40 Kg (2 pieces)"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {mobileTab === "rules" && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="border border-gray-150 rounded-xl p-3 bg-white shadow-xs">
                    <h5 className="font-bold text-[11px] text-slate-800 mb-2 border-b border-gray-100 pb-1.5">
                      Date Change Fee
                    </h5>
                    <ul className="space-y-1.5 text-[10px] text-slate-500 font-semibold">
                      <li className="flex justify-between">
                        <span>More than 72 hours:</span>
                        <span className="text-blue-500">BDT 2,500</span>
                      </li>
                      <li className="flex justify-between">
                        <span>24 to 72 hours:</span>
                        <span className="text-blue-500">BDT 3,500</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Within 24 hours:</span>
                        <span className="text-rose-500">BDT 5,000</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border border-gray-150 rounded-xl p-3 bg-white shadow-xs">
                    <h5 className="font-bold text-[11px] text-slate-800 mb-2 border-b border-gray-100 pb-1.5">
                      Cancellation & Refund Fee
                    </h5>
                    <ul className="space-y-1.5 text-[10px] text-slate-500 font-semibold">
                      <li className="flex justify-between">
                        <span>More than 72 hours:</span>
                        <span className="text-blue-500">BDT 3,500</span>
                      </li>
                      <li className="flex justify-between">
                        <span>24 to 72 hours:</span>
                        <span className="text-blue-500">BDT 4,500</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Within 24 hours:</span>
                        <span className="text-rose-500">Non-Refundable</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {mobileTab === "refund" && (
                <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-xs space-y-2.5 text-[10px] font-semibold text-slate-500">
                  <p>
                    1. Refunds are subject to the carrier&apos;s policy and
                    might incur a cancellation fee.
                  </p>
                  <p>
                    2. For refundable tickets, cancellation requests must be
                    submitted online at least 4 hours prior to flight departure.
                  </p>
                  <p>
                    3. The refund process takes 7-10 working days, and the
                    amount will be credited back to your original payment card.
                  </p>
                  <div className="flex items-center gap-2 mt-3 p-2 bg-emerald-50 text-emerald-800 rounded border border-emerald-100 text-[9px] font-bold">
                    <svg
                      className="h-3.5 w-3.5 text-emerald-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
                      />
                    </svg>
                    This ticket is partially refundable under standard airlines
                    rules.
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Sheet Footer */}
            <div className="bg-white border-t border-gray-150 p-4 flex items-center justify-between shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] pb-6">
              <div>
                <div className="text-lg font-black text-blue-600 leading-none">
                  {priceFormatted}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 leading-none">
                  <span className="text-emerald-600 mr-1">Save</span>
                  <span className="line-through">{originalPriceFormatted}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeBottomSheet();
                  onSelect(flight);
                }}
                className="bg-blue-600 hover:bg-orange-600 text-white font-extrabold px-5.5 py-3 rounded-full text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer select-none"
              >
                <span>Select Flight</span>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
});
