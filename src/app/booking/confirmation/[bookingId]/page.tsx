"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useBookingStore } from "@/store/bookingStore";
import { formatPrice } from "@/shared/utils/formatPrice";
import { formatDuration } from "@/shared/utils/formatDuration";
import { cn } from "@/shared/utils/cn";
import { FlightSegment, SavedBooking } from "@/shared/types";
import mealsData from "@/data/meals.json";
import baggageData from "@/data/baggageOptions.json";
import insuranceData from "@/data/insurance.json";
import {
  formatTicketDate,
  formatTicketDateShort,
  formatTicketTime,
} from "@/shared/utils/formatDate";

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { selectedFlight, passengerCount, formData, resetBooking } =
    useBookingStore();
  const [showConfetti, setShowConfetti] = useState(true);
  const [localBooking, setLocalBooking] = useState<SavedBooking | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formattedBookingDate, setFormattedBookingDate] = useState<string>("");

  // Fallback to localStorage booking details if Zustand store is cleared on refresh
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const bookingsStr = localStorage.getItem("flynext_bookings_demo_data");
        if (bookingsStr) {
          const bookings = JSON.parse(bookingsStr);
          const found = bookings.find(
            (b: SavedBooking) => b.bookingId === bookingId,
          );
          if (found) {
            // Defer to avoid synchronous setState inside useEffect warning
            setTimeout(() => setLocalBooking(found), 0);
          }
        }
      } catch (e) {
        console.error("Failed to load local booking", e);
      }
    }
  }, [bookingId]);

  // Set pure booking receipt date
  useEffect(() => {
    const dateToUse = localBooking?.createdAt || new Date().toISOString();
    const formatted = formatTicketDateShort(dateToUse);
    setTimeout(() => setFormattedBookingDate(formatted), 0);
  }, [localBooking]);

  // Turn off confetti after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Derive all needed data from store or fallback to localStorage
  const flight = selectedFlight || localBooking?.flight;
  const currentPassengerCount = selectedFlight
    ? passengerCount
    : localBooking?.passengerCount;
  const currentFormData = selectedFlight ? formData : localBooking?.formData;
  const savedPrice = localBooking?.totalPrice;

  // Confetti rendering array (pre-computed positions to avoid hydration warnings)
  const confettiItems = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        left: `${(i * 3.3 + (i % 3) * 11) % 100}%`,
        top: `${(i * 4.7 + (i % 4) * 13) % 100}%`,
        animationDelay: `${(i * 0.1) % 2.5}s`,
        animationDuration: `${2.5 + (i % 3) * 0.7}s`,
        fontSize: `${12 + (i % 5) * 3}px`,
        color: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i % 5],
      })),
    [],
  );

  if (!flight || !currentPassengerCount || !currentFormData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center max-w-sm">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Loading Booking
          </h2>
          <p className="text-xs text-gray-500">
            Retrieving booking reference {bookingId}...
          </p>
        </div>
      </div>
    );
  }

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  // Pricing calculations
  const adultTotal = flight.price.amount * currentPassengerCount.adults;
  const childTotal =
    currentPassengerCount.children * Math.round(flight.price.amount * 0.75);
  const kidsTotal =
    currentPassengerCount.kids * Math.round(flight.price.amount * 0.75);
  const infantTotal =
    currentPassengerCount.infants * Math.round(flight.price.amount * 0.1);
  const subtotal = adultTotal + childTotal + kidsTotal + infantTotal;
  const discount = Math.round(flight.price.amount * 0.06);

  // Extra charges calculation
  const insTotal = currentFormData.addOns.reduce((sum: number, ao) => {
    const ins = insuranceData.find((i) => i.id === ao.insuranceId);
    return sum + (ins?.price.amount ?? 0);
  }, 0);
  const bagTotal = currentFormData.baggage.reduce((sum: number, b) => {
    const bag = baggageData.find((bo) => bo.id === b.extraBaggageId);
    return sum + (bag?.price.amount ?? 0);
  }, 0);
  const extraCharges = insTotal + bagTotal;
  const totalPrice = savedPrice || subtotal - discount + 108 + extraCharges;

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50/60 to-gray-50/50 p-4 lg:p-8 flex flex-col items-center justify-center print:bg-white print:p-0">
      {/* ── Screen: Confetti Background ───────────────── */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden print:hidden z-0">
          {confettiItems.map((item, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.animationDelay,
                animationDuration: item.animationDuration,
                fontSize: item.fontSize,
                color: item.color,
                opacity: 0.7,
              }}
            >
              {["🎉", "✈️", "🎊", "⭐", "🎈"][i % 5]}
            </div>
          ))}
        </div>
      )}

      {/* ── Screen: Confirmation Card ─────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-lg w-full p-6 lg:p-8 text-center relative z-10 print:hidden mb-8">
        {/* Checkmark icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto mb-5 shadow-sm border border-emerald-200">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-1.5 tracking-tight">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-xs font-semibold text-gray-500 mb-6">
          Your e-ticket voucher has been generated successfully.
        </p>

        {/* Reference Banner */}
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-4 mb-5">
          <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest mb-0.5">
            Booking Reference / PNR
          </p>
          <p className="text-2xl font-black text-primary-600 tracking-widest font-mono select-all">
            {bookingId}
          </p>
        </div>

        {/* Recap panel */}
        {firstSegment && lastSegment && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 text-left text-xs font-semibold text-gray-700">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-3">
              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  {firstSegment.departure.airport.code} →{" "}
                  {lastSegment.arrival.airport.code}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">
                  {firstSegment.airline.name} • {firstSegment.flightNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-primary-600">
                  {formatPrice(totalPrice)}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">
                  Paid (Total)
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-gray-500">
              <div className="flex justify-between">
                <span>Passengers:</span>
                <span className="text-gray-900 font-bold">
                  {currentFormData.passengers.length} passengers
                </span>
              </div>
              <div className="flex justify-between">
                <span>Departure Date:</span>
                <span className="text-gray-900 font-bold">
                  {formatTicketDate(firstSegment.departure.time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Class / Cabin:</span>
                <span className="text-gray-900 font-bold capitalize">
                  {flight.cabin} class
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <Link
            href="/"
            onClick={() => resetBooking()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Book Another Flight</span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewOpen((prev) => !prev)}
              className="border border-gray-200 text-gray-700 font-extrabold py-3 rounded-xl text-xs hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isPreviewOpen ? "Hide Preview" : "Preview Ticket"}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-gray-900 hover:bg-black text-white font-extrabold py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.617 0-1.11-.497-1.12-1.115L6.34 18m11.32 0a9 9 0 0 0 0-18H6.34a9 9 0 0 0 0 18m11.32 0H6.34"
                />
              </svg>
              <span>Print Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Real Flight E-Ticket UI (Visible in Print, Toggleable in Preview) ────────────────── */}
      <div
        className={cn(
          "max-w-4xl w-full bg-white border border-gray-300 rounded-xl shadow-lg p-6 lg:p-8 font-mono text-xs text-gray-800 leading-normal",
          "print:block print:w-full print:border-none print:shadow-none print:p-0 print:mt-0",
          isPreviewOpen ? "block animate-fade-in" : "hidden print:block",
        )}
      >
        {/* Print Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-950 pb-4 mb-5 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tighter text-blue-600 font-sans">
              FlyNext<span className="text-gray-900 font-light">✈️</span>
            </span>
            <span className="border-l border-gray-300 pl-3 text-[10px] text-gray-500 font-sans font-bold">
              ELECTRONIC TICKET RECEIPT
            </span>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              Booking Date
            </p>
            <p className="font-extrabold">{formattedBookingDate}</p>
          </div>
        </div>

        {/* PNR Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">
              Booking PNR / Ref
            </span>
            <span className="text-base font-black text-primary-600 tracking-wider font-mono uppercase">
              {bookingId}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">
              Status
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 uppercase">
              ● CONFIRMED & PAID
            </span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mb-0.5">
              Payment Method
            </span>
            <span className="text-[11px] font-bold text-gray-700">
              Card ending in {currentFormData.payment.cardNumber.slice(-4)}
            </span>
          </div>
        </div>

        {/* Flight Itinerary */}
        <h3 className="text-[11px] font-black text-gray-950 border-b border-gray-300 pb-1.5 mb-3 uppercase tracking-wider">
          Flight Itinerary & Flight Details
        </h3>

        {flight.segments.map((segment: FlightSegment, sIdx: number) => {
          const isLandedNextDay =
            new Date(segment.arrival.time).getDate() !==
            new Date(segment.departure.time).getDate();
          return (
            <div
              key={segment.flightNumber || sIdx}
              className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between pb-3 border-b border-dashed border-gray-200 mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {segment.airline.logo && (
                    <div className="relative h-6 w-6 overflow-hidden shrink-0 border border-gray-100 rounded-md p-0.5 bg-white">
                      <Image
                        src={segment.airline.logo}
                        alt={segment.airline.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="font-bold text-gray-900">
                    {segment.airline.name}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-bold text-gray-500">
                    {segment.flightNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-gray-600">
                    {flight.cabin} Class
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Departure info */}
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">
                    Departing From
                  </p>
                  <p className="text-sm font-black text-gray-955">
                    {segment.departure.airport.code}
                  </p>
                  <p className="font-bold text-gray-800 leading-tight mt-0.5">
                    {segment.departure.airport.name}
                  </p>
                  <p className="text-[10px] font-bold text-primary-600 mt-1">
                    {formatTicketDate(segment.departure.time)}
                  </p>
                  <p className="text-sm font-black text-gray-955 mt-0.5">
                    {formatTicketTime(segment.departure.time)}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    Terminal {segment.departure.terminal || "1"}
                  </p>
                </div>

                {/* Duration / Arrow */}
                <div className="flex flex-col items-center justify-center text-center py-2 md:py-0">
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                    {formatDuration(segment.durationMinutes)}
                  </span>

                  {/* Decorative flight line */}
                  <div className="w-24 border-t-2 border-dashed border-gray-300 my-1.5 relative">
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-gray-400 bg-white px-1">
                      ✈️
                    </span>
                  </div>

                  <span className="text-[9px] font-extrabold text-emerald-600 uppercase mt-0.5">
                    Non-Stop
                  </span>
                </div>

                {/* Arrival info */}
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">
                    Arriving At
                  </p>
                  <p className="text-sm font-black text-gray-955">
                    {segment.arrival.airport.code}
                  </p>
                  <p className="font-bold text-gray-800 leading-tight mt-0.5">
                    {segment.arrival.airport.name}
                  </p>
                  <p className="text-[10px] font-bold text-primary-600 mt-1">
                    {formatTicketDate(segment.arrival.time)}
                    {isLandedNextDay && (
                      <span className="text-rose-500 font-extrabold ml-1 border border-rose-200 px-1 py-0.5 rounded text-[8px] bg-rose-50">
                        +1 DAY
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-black text-gray-955 mt-0.5">
                    {formatTicketTime(segment.arrival.time)}
                  </p>
                  <p className="text-[9px] text-gray-400 font-medium">
                    Terminal {segment.arrival.terminal || "1"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Passengers details table */}
        <h3 className="text-[11px] font-black text-gray-950 border-b border-gray-300 pb-1.5 mt-6 mb-3 uppercase tracking-wider">
          Passenger & Travel Services Details
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-extrabold text-gray-500 uppercase">
                <th className="p-3">Passenger Name</th>
                <th className="p-3">Seat No</th>
                <th className="p-3">Meals & Extras</th>
                <th className="p-3">Baggage Allowance</th>
                <th className="p-3 text-right">E-Ticket Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold">
              {currentFormData.passengers.map((pax, i: number) => {
                const seat =
                  currentFormData.seats[i]?.seatNumber || "Auto-Assigned";

                // Fetch meal name
                const mealId =
                  currentFormData.addOns[i]?.mealType || "standard";
                const meal =
                  mealsData.find((m) => m.id === mealId)?.name ||
                  "Standard Meal";
                const wheelchair = currentFormData.addOns[i]?.wheelchairRequired
                  ? "Yes (Wheelchair)"
                  : "";

                // Fetch extra baggage weight
                const extraBagId =
                  currentFormData.baggage[i]?.extraBaggageId || "bag_0";
                const extraBagWeight =
                  baggageData.find((bo) => bo.id === extraBagId)?.weightKg || 0;
                const totalBaggage = 20 + extraBagWeight; // 20kg is base allowance

                const ticketNo = `997-2026${bookingId.slice(-4)}${i + 1}`;

                return (
                  <tr key={i} className="text-gray-800">
                    <td className="p-3">
                      <p className="font-extrabold text-sm uppercase text-gray-900">
                        {pax.surname}, {pax.givenName}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                        {i < currentPassengerCount.adults ? "Adult" : "Child"} •{" "}
                        {pax.gender}
                      </p>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                        {seat}
                      </span>
                    </td>
                    <td className="p-3 leading-tight">
                      <p>{meal}</p>
                      {wheelchair && (
                        <p className="text-rose-500 text-[9px] font-bold mt-0.5">
                          {wheelchair}
                        </p>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">
                        {totalBaggage} kg
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold mt-0.5">
                        20kg Base + {extraBagWeight}kg Extra
                      </p>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-600 text-xs">
                      {ticketNo}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Fare and payment details */}
        <h3 className="text-[11px] font-black text-gray-950 border-b border-gray-300 pb-1.5 mt-6 mb-3 uppercase tracking-wider">
          Receipt / Payment Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="space-y-1.5 font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Air Fare Subtotal:</span>
              <span className="text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Promo Discount (6%):</span>
              <span>-{formatPrice(discount)}</span>
            </div>
            {extraCharges > 0 && (
              <div className="flex justify-between">
                <span>Add-Ons & Baggage Fee:</span>
                <span className="text-gray-900">
                  +{formatPrice(extraCharges)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Convenience Fee:</span>
              <span className="text-gray-900">+৳108</span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-gray-200 pt-1.5 text-gray-900">
              <span>Total Price Paid:</span>
              <span className="text-primary-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 text-center">
            {/* Barcode */}
            <div className="flex items-center gap-px h-10 w-52 bg-white overflow-hidden mb-1 justify-center border border-gray-100 p-1">
              {Array.from({ length: 42 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-full bg-black shrink-0"
                  style={{
                    width: `${idx % 4 === 0 ? 3 : idx % 3 === 0 ? 1 : idx % 2 === 0 ? 2 : 1.5}px`,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[9px] text-gray-400 font-bold uppercase tracking-widest">
              *{bookingId}*
            </span>
          </div>
        </div>

        {/* Print instructions */}
        <div className="border-t border-gray-300 pt-4 mt-6 text-[10px] text-gray-400 font-sans leading-relaxed">
          <p className="font-bold uppercase text-gray-500 mb-1">
            Important Travel Information
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Please present a printed copy of this e-ticket receipt and a valid
              passport/ID at the check-in desk.
            </li>
            <li>
              For international flights, check-in counters open 3 hours before
              departure and close exactly 60 minutes prior.
            </li>
            <li>
              Make sure to verify visa regulations and valid exit/entry permits
              for your destination.
            </li>
            <li>
              Free check-in baggage allowance is 20 kg per adult/child
              passenger. Hand baggage must not exceed 7 kg.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
