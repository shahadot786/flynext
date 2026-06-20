import { Suspense } from "react";
import type { Metadata } from "next";
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

  // Extract and normalise URL search params
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

  return (
    <div className="min-h-screen lg:h-[calc(100vh-64px)] lg:flex lg:flex-col lg:overflow-hidden bg-[#e2e8f0] search-page-container">
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
