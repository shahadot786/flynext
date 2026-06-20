import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import flightsData from "@/data/flights.json";
import { FlightSchema } from "@/shared/types";

const SearchParamsSchema = z.object({
  origin: z.string().length(3, "Origin must be a 3-letter IATA code"),
  destination: z.string().length(3, "Destination must be a 3-letter IATA code"),
  date: z.string().optional(),
  adults: z.coerce.number().min(1).max(9).default(1),
  children: z.coerce.number().min(0).max(9).default(0),
  kids: z.coerce.number().min(0).max(9).default(0),
  infants: z.coerce.number().min(0).max(9).default(0),
  cabin: z
    .enum(["economy", "premium-economy", "business", "first"])
    .default("economy"),
  simulate_error: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Parse and validate query params
  const parsed = SearchParamsSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid search parameters",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { origin, destination, cabin, simulate_error } = parsed.data;

  // Simulate error if requested
  if (simulate_error) {
    return NextResponse.json(
      { message: "Simulated error" },
      { status: simulate_error },
    );
  }

  // Simulate realistic network latency (200-500ms)
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 300),
  );

  // Filter flights from mock data
  // Type assertion needed because JSON import doesn't carry full Flight type
  type Flight = z.infer<typeof FlightSchema>;
  const flights = (flightsData as Flight[]).filter((flight) => {
    const firstSegment = flight.segments[0];
    const lastSegment = flight.segments[flight.segments.length - 1];

    const matchesOrigin =
      firstSegment?.departure?.airport?.code === origin.toUpperCase();
    const matchesDest =
      lastSegment?.arrival?.airport?.code === destination.toUpperCase();
    const matchesCabin = flight.cabin === cabin;

    return matchesOrigin && matchesDest && matchesCabin;
  });

  return NextResponse.json(flights);
}
