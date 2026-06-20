"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/shared/utils/formatPrice";
import { formatDuration } from "@/shared/utils/formatDuration";
import { SavedBooking } from "@/shared/types";
import {
  formatBookingDate,
  formatBookingTime,
} from "@/shared/utils/formatDate";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<SavedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const bookingsStr = localStorage.getItem("flynext_bookings_demo_data");
        if (bookingsStr) {
          const parsed = JSON.parse(bookingsStr);
          setTimeout(() => setBookings(parsed), 0);
        }
      } catch (e) {
        console.error("Failed to parse bookings from localStorage", e);
      } finally {
        setTimeout(() => setIsLoading(false), 0);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              My Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              View and manage your booked flight itineraries and ticket
              receipts.
            </p>
          </div>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all text-center cursor-pointer"
          >
            New Search
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse flex flex-col gap-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-6 bg-gray-200 rounded w-1/4 self-end" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center max-w-lg mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500 mx-auto mb-5 border border-blue-100 shadow-sm">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">
              No Bookings Found
            </h2>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              You haven&apos;t booked any flights with FlyNext yet. Ready to
              start planning your next journey?
            </p>
            <Link
              href="/"
              className="bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all inline-block cursor-pointer"
            >
              Search Flights Now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const { flight, bookingId, createdAt, totalPrice, formData } =
                booking;
              const firstSegment = flight?.segments?.[0];
              const lastSegment =
                flight?.segments?.[flight.segments.length - 1];

              if (!firstSegment || !lastSegment) return null;

              return (
                <div
                  key={bookingId}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Top Banner */}
                  <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">
                          Booking Reference
                        </span>
                        <span className="font-mono font-black text-gray-900 text-sm tracking-wider uppercase">
                          {bookingId}
                        </span>
                      </div>
                      <div className="border-l border-gray-200 pl-4">
                        <span className="text-[10px] text-gray-400 font-extrabold uppercase block tracking-wider">
                          Date Booked
                        </span>
                        <span className="text-gray-700 text-xs font-bold">
                          {formatBookingDate(createdAt)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                        Confirmed
                      </span>
                    </div>
                  </div>

                  {/* Card Middle: Flight Route */}
                  <div className="p-5">
                    <div className="flex items-start justify-between flex-wrap gap-5">
                      <div className="flex items-center gap-3">
                        {firstSegment.airline.logo && (
                          <div className="relative h-9 w-9 overflow-hidden shrink-0 border border-gray-100 rounded-lg p-0.5 bg-white shadow-sm">
                            <Image
                              src={firstSegment.airline.logo}
                              alt={firstSegment.airline.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                            <span>{firstSegment.departure.airport.code}</span>
                            <span className="text-gray-400 font-normal">→</span>
                            <span>{lastSegment.arrival.airport.code}</span>
                          </h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                            {firstSegment.airline.name} •{" "}
                            {firstSegment.flightNumber}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs font-semibold text-gray-500">
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Departure
                          </p>
                          <p className="text-gray-900 font-bold mt-0.5">
                            {formatBookingTime(firstSegment.departure.time)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Arrival
                          </p>
                          <p className="text-gray-900 font-bold mt-0.5">
                            {formatBookingTime(lastSegment.arrival.time)}
                          </p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            Duration
                          </p>
                          <p className="text-gray-900 font-bold mt-0.5">
                            {formatDuration(flight.totalDurationMinutes)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Summary + Actions */}
                  <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                      <div>
                        <span>Passengers:</span>{" "}
                        <span className="text-gray-950 font-bold">
                          {formData?.passengers?.length || 1} Pax
                        </span>
                      </div>
                      <div className="border-l border-gray-200 pl-4">
                        <span>Total Paid:</span>{" "}
                        <span className="text-primary-600 font-black text-sm">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/booking/confirmation/${bookingId}`}
                        className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        View Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
