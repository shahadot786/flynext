"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { formatPrice } from "@/shared/utils/formatPrice";
import { formatDuration } from "@/shared/utils/formatDuration";
import type { Flight, PassengerCount } from "@/shared/types";
import { formatDateShort, formatTicketTime } from "@/shared/utils/formatDate";

// ─── Props ─────────────────────────────────────────────────

type FlightSummaryCardProps = {
  flight: Flight;
  passengerCount: PassengerCount;
  extraCharges?: number;
};

// ─── Component ─────────────────────────────────────────────

export function FlightSummaryCard({
  flight,
  passengerCount,
  extraCharges = 0,
}: FlightSummaryCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  if (!firstSegment || !lastSegment) return null;

  const airline = firstSegment.airline;
  const originCode = firstSegment.departure.airport.code;
  const destCode = lastSegment.arrival.airport.code;
  const depDate = formatDateShort(firstSegment.departure.time);
  const depTime = formatTicketTime(firstSegment.departure.time);
  const arrTime = formatTicketTime(lastSegment.arrival.time);

  // Price breakdown
  const baseFarePerPax = Math.round(flight.price.amount * 0.82);
  const taxPerPax = flight.price.amount - baseFarePerPax;
  const discount = Math.round(flight.price.amount * 0.06);
  const convenienceFee = 108;

  const adultTotal = passengerCount.adults * flight.price.amount;
  const childTotal =
    passengerCount.children * Math.round(flight.price.amount * 0.75);
  const kidsTotal =
    passengerCount.kids * Math.round(flight.price.amount * 0.75);
  const infantTotal =
    passengerCount.infants * Math.round(flight.price.amount * 0.1);
  const subtotal = adultTotal + childTotal + kidsTotal + infantTotal;
  const totalPrice = subtotal - discount + convenienceFee + extraCharges;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Route Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative h-7 w-7 rounded-md overflow-hidden border border-gray-100 bg-white p-0.5 shrink-0">
              <Image
                src={airline.logo}
                alt={airline.name}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                <span>{originCode}</span>
                <span className="text-gray-400">→</span>
                <span>{destCode}</span>
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                One-Way • {depDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            className="text-[11px] font-bold text-primary-500 border border-primary-200 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
          >
            Details
          </button>
        </div>

        {/* Expandable flight details */}
        {isDetailsOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold">
                {airline.name} • {firstSegment.flightNumber}
              </span>
              <span className="text-gray-400 font-medium">
                {formatDuration(flight.totalDurationMinutes)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-700">{depTime}</span>
              <span className="text-gray-400">→</span>
              <span className="font-bold text-gray-700">{arrTime}</span>
            </div>
            <div className="text-[10px] text-gray-400 font-medium">
              {flight.stops.length === 0
                ? "Non-stop"
                : `${flight.stops.length} Stop${flight.stops.length > 1 ? "s" : ""} (${flight.stops.map((s) => s.airport.code).join(", ")})`}
            </div>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="p-4 space-y-2.5">
        {/* Air Fare header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
            <span className="text-xs font-bold text-gray-700">Air Fare ▴</span>
          </div>
          <span className="text-xs font-extrabold text-gray-800">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Per-pax breakdown */}
        <div className="pl-5 space-y-1.5">
          {passengerCount.adults > 0 && (
            <>
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span>{passengerCount.adults} x BaseFare (Adult)</span>
                <span>
                  {formatPrice(baseFarePerPax * passengerCount.adults)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span>{passengerCount.adults} x Tax (Adult)</span>
                <span>{formatPrice(taxPerPax * passengerCount.adults)}</span>
              </div>
            </>
          )}
          {passengerCount.children > 0 && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>{passengerCount.children} x Fare (Child)</span>
              <span>{formatPrice(childTotal)}</span>
            </div>
          )}
          {passengerCount.kids > 0 && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>{passengerCount.kids} x Fare (Kid)</span>
              <span>{formatPrice(kidsTotal)}</span>
            </div>
          )}
          {passengerCount.infants > 0 && (
            <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
              <span>{passengerCount.infants} x Fare (Infant)</span>
              <span>{formatPrice(infantTotal)}</span>
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">🏷️</span>
            <span className="text-[11px] font-bold text-emerald-600">
              Discount Availed
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600">
            - {formatPrice(discount)}
          </span>
        </div>

        {/* Convenience Fee */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">⚙️</span>
            <span className="text-[11px] font-medium text-gray-500">
              Convenience Fee
            </span>
          </div>
          <span className="text-[11px] font-medium text-gray-500">
            + {formatPrice(convenienceFee)}
          </span>
        </div>

        {/* Extra charges if any */}
        {extraCharges > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">🧳</span>
              <span className="text-[11px] font-medium text-gray-500">
                Add-ons & Extras
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-500">
              + {formatPrice(extraCharges)}
            </span>
          </div>
        )}

        {/* Total */}
        <div
          className={cn(
            "flex items-center justify-between pt-3 mt-1 border-t border-gray-200",
          )}
        >
          <span className="text-sm font-extrabold text-gray-900">
            Total Price
          </span>
          <span className="text-lg font-black text-gray-900">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Bottom Bar ─────────────────────────────────────

type MobileBottomBarProps = {
  flight: Flight;
  passengerCount: PassengerCount;
  extraCharges?: number;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
};

export function MobileBottomBar({
  flight,
  passengerCount,
  extraCharges = 0,
  totalSteps,
  onBack,
  onNext,
  currentStep,
  isNextDisabled = false,
  isSubmitting = false,
  nextLabel = "Next",
}: MobileBottomBarProps) {
  const [showPriceDetail, setShowPriceDetail] = useState(false);

  const adultTotal = passengerCount.adults * flight.price.amount;
  const childTotal =
    passengerCount.children * Math.round(flight.price.amount * 0.75);
  const kidsTotal =
    passengerCount.kids * Math.round(flight.price.amount * 0.75);
  const infantTotal =
    passengerCount.infants * Math.round(flight.price.amount * 0.1);
  const subtotal = adultTotal + childTotal + kidsTotal + infantTotal;
  const discount = Math.round(flight.price.amount * 0.06);
  const convenienceFee = 108;
  const totalPrice = subtotal - discount + convenienceFee + extraCharges;

  return (
    <>
      {/* Price detail popup */}
      {showPriceDetail && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPriceDetail(false)}
        >
          <div className="absolute bottom-17 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-xl p-4 animate-slide-up">
            <FlightSummaryCard
              flight={flight}
              passengerCount={passengerCount}
              extraCharges={extraCharges}
            />
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between lg:hidden">
        {/* Price */}
        <button
          type="button"
          onClick={() => setShowPriceDetail((p) => !p)}
          className="text-left cursor-pointer"
        >
          <div className="flex items-center gap-1">
            <span className="text-base font-black text-gray-900">
              ৳{totalPrice.toLocaleString("en-IN")}
            </span>
            <svg
              className={cn(
                "h-3 w-3 text-gray-500 transition-transform",
                showPriceDetail && "rotate-180",
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold leading-none mt-0.5">
            Save ৳{discount.toLocaleString("en-IN")}
          </p>
        </button>

        {/* Navigation */}
        <div className="flex items-center gap-2.5">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer px-3 py-2"
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
              <span>Back</span>
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled || isSubmitting}
            className={cn(
              "flex items-center gap-1 font-extrabold px-5 py-2.5 rounded-full text-sm shadow-md transition-all cursor-pointer",
              isNextDisabled || isSubmitting
                ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none shadow-none"
                : currentStep === totalSteps
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-primary-600 hover:bg-primary-700 text-white",
            )}
          >
            <span>{isSubmitting ? "Processing..." : nextLabel}</span>
            {!isSubmitting && (
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
            )}
          </button>
        </div>
      </div>
    </>
  );
}
