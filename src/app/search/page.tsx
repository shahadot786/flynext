import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ResultsClient } from "./ResultsClient";

// ─── Metadata ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Search Results — FlyNext",
  description:
    "Compare flights, filter by stops, price, airlines, and departure time. Find the best deal for your journey.",
};

// ─── Search Params Type ────────────────────────────────────

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// ─── Page (Server Component) ──────────────────────────────

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  // Extract and normalize URL search params
  const origin = typeof params.origin === "string" ? params.origin : "";
  const destination =
    typeof params.destination === "string" ? params.destination : "";
  const date = typeof params.date === "string" ? params.date : "";
  const returnDate =
    typeof params.returnDate === "string" ? params.returnDate : undefined;
  const adults = Number(params.adults) || 1;
  const childrenCount = Number(params.children) || 0;
  const kids = Number(params.kids) || 0;
  const infants = Number(params.infants) || 0;
  const cabin = typeof params.cabin === "string" ? params.cabin : "economy";

  // Build query string to pass current search params back to home for modification
  const queryParams = new URLSearchParams();
  if (origin) queryParams.set("origin", origin);
  if (destination) queryParams.set("destination", destination);
  if (date) queryParams.set("date", date);
  if (returnDate) queryParams.set("returnDate", returnDate);
  queryParams.set("adults", adults.toString());
  queryParams.set("children", childrenCount.toString());
  queryParams.set("kids", kids.toString());
  queryParams.set("infants", infants.toString());
  queryParams.set("cabin", cabin);
  const modifyUrl = `/?${queryParams.toString()}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Route Summary Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {origin} → {destination}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {date}
                {returnDate ? ` — ${returnDate}` : " · One way"}
                {" · "}
                {adults + childrenCount + kids + infants} traveller
                {adults + childrenCount + kids + infants !== 1 ? "s" : ""}
                {" · "}
                {cabin.charAt(0).toUpperCase() + cabin.slice(1)}
              </p>
            </div>
            <Link
              href={modifyUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm shrink-0"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Search
            </Link>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <Suspense fallback={null}>
        <ResultsClient
          origin={origin}
          destination={destination}
          date={date}
          returnDate={returnDate}
          adults={adults}
          childrenCount={childrenCount}
          kids={kids}
          infants={infants}
          cabin={cabin}
        />
      </Suspense>
    </div>
  );
}
