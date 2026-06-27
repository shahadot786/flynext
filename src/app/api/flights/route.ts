import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Duffel } from "@duffel/api";
import { FlightSchema, CabinClassSchema } from "@/shared/types";

const duffel = new Duffel({
  token: process.env.NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN || "",
});

const SearchParamsSchema = z.object({
  origin: z.string().length(3, "Origin must be a 3-letter IATA code"),
  destination: z.string().length(3, "Destination must be a 3-letter IATA code"),
  date: z.string().min(1, "Date is required"),
  returnDate: z.string().optional(),
  adults: z.coerce.number().min(1).max(9).default(1),
  children: z.coerce.number().min(0).max(9).default(0),
  kids: z.coerce.number().min(0).max(9).default(0),
  infants: z.coerce.number().min(0).max(9).default(0),
  cabin: z
    .enum(["economy", "premium-economy", "business", "first"])
    .default("economy"),
  simulate_error: z.coerce.number().optional(),
});

function parseISO8601Duration(durationStr: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = durationStr.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  return hours * 60 + minutes;
}

function convertPriceToBDT(amountStr: string, currency: string): number {
  const amount = parseFloat(amountStr);
  if (currency === "BDT") return Math.round(amount);

  const rates: Record<string, number> = {
    USD: 120,
    GBP: 150,
    EUR: 130,
    AED: 32,
    SAR: 32,
  };

  const rate = rates[currency.toUpperCase()] || 120;
  return Math.round(amount * rate);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

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

  const {
    origin,
    destination,
    date,
    returnDate,
    adults,
    children,
    kids,
    infants,
    cabin,
    simulate_error,
  } = parsed.data;

  if (simulate_error) {
    return NextResponse.json(
      { message: "Simulated error" },
      { status: simulate_error },
    );
  }

  if (!process.env.NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json(
      { message: "Duffel access token is not configured in .env.local" },
      { status: 500 },
    );
  }

  try {
    const formattedDate = date.split("T")[0]!;
    const formattedReturnDate = returnDate ? returnDate.split("T")[0] : undefined;

    const duffelCabin = cabin === "premium-economy" ? "premium_economy" : cabin;

    const passengersList: Array<
      | { type: "adult"; age?: never; fare_type?: never }
      | { age: number; type?: never; fare_type?: never }
    > = [];
    for (let i = 0; i < adults; i++) {
      passengersList.push({ type: "adult" });
    }
    for (let i = 0; i < children + kids; i++) {
      passengersList.push({ age: 10 });
    }
    for (let i = 0; i < infants; i++) {
      passengersList.push({ age: 1 });
    }

    const slices = [
      {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_date: formattedDate,
        arrival_time: null,
        departure_time: null,
      },
    ];

    if (formattedReturnDate) {
      slices.push({
        origin: destination.toUpperCase(),
        destination: origin.toUpperCase(),
        departure_date: formattedReturnDate,
        arrival_time: null,
        departure_time: null,
      });
    }

    const searchResponse = await duffel.offerRequests.create({
      slices,
      passengers: passengersList,
      cabin_class: duffelCabin as "economy" | "premium_economy" | "business" | "first",
    });

    const offers = searchResponse.data.offers || [];

    type Flight = z.infer<typeof FlightSchema>;
    const flights: Flight[] = offers.map((offer) => {
      const segments: Flight["segments"] = [];
      const stops: Flight["stops"] = [];
      let totalDurationMinutes = 0;

      offer.slices.forEach((slice) => {
        const sliceSegments = slice.segments || [];
        
        // Calculate stops/layovers within this slice
        for (let i = 0; i < sliceSegments.length - 1; i++) {
          const current = sliceSegments[i]!;
          const next = sliceSegments[i + 1]!;
          const depTime = new Date(next.departing_at).getTime();
          const arrTime = new Date(current.arriving_at).getTime();
          const layoverMs = depTime - arrTime;
          const layoverMinutes = Math.max(0, Math.round(layoverMs / 1000 / 60));

          stops.push({
            airport: {
              code: current.destination.iata_code || "",
              name: current.destination.name || "",
              city: current.destination.city_name || current.destination.city?.name || current.destination.iata_code || "",
              country: current.destination.iata_country_code || "",
            },
            durationMinutes: layoverMinutes,
          });
        }

        // Map segments
        sliceSegments.forEach((seg) => {
          const duration = parseISO8601Duration(seg.duration || "PT0M");
          segments.push({
            flightNumber: `${seg.marketing_carrier.iata_code || ""}-${seg.marketing_carrier_flight_number || ""}`,
            airline: {
              code: seg.marketing_carrier.iata_code || "",
              name: seg.marketing_carrier.name || "",
              logo: seg.marketing_carrier.logo_symbol_url || "",
            },
            departure: {
              airport: {
                code: seg.origin.iata_code || "",
                name: seg.origin.name || "",
                city: seg.origin.city_name || seg.origin.city?.name || seg.origin.iata_code || "",
                country: seg.origin.iata_country_code || "",
              },
              time: seg.departing_at,
              terminal: seg.origin_terminal || undefined,
            },
            arrival: {
              airport: {
                code: seg.destination.iata_code || "",
                name: seg.destination.name || "",
                city: seg.destination.city_name || seg.destination.city?.name || seg.destination.iata_code || "",
                country: seg.destination.iata_country_code || "",
              },
              time: seg.arriving_at,
              terminal: seg.destination_terminal || undefined,
            },
            durationMinutes: duration,
          });
        });

        // Sum duration
        if (slice.duration) {
          totalDurationMinutes += parseISO8601Duration(slice.duration);
        } else {
          sliceSegments.forEach((seg) => {
            totalDurationMinutes += parseISO8601Duration(seg.duration || "PT0M");
          });
        }
      });

      const convertedPrice = convertPriceToBDT(offer.total_amount, offer.total_currency);

      const cabinClassMap: Record<string, string> = {
        economy: "economy",
        premium_economy: "premium-economy",
        business: "business",
        first: "first",
      };

      const offerCabin = offer.slices[0]?.segments[0]?.passengers[0]?.cabin_class || "economy";
      const cabinClass = (cabinClassMap[offerCabin] || "economy") as z.infer<typeof CabinClassSchema>;

      return {
        id: offer.id,
        segments,
        stops,
        totalDurationMinutes,
        price: {
          amount: convertedPrice,
          currency: "BDT",
        },
        cabin: cabinClass,
        seatsAvailable: 9,
      };
    });

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Duffel Search Error:", error);
    const duffelErr = error as {
      meta?: { status?: number };
      errors?: Array<{ message?: string }>;
      message?: string;
    };
    const status = duffelErr.meta?.status || 500;
    const message = duffelErr.errors?.[0]?.message || duffelErr.message || "Failed to search flights from Duffel";
    return NextResponse.json(
      { message },
      { status },
    );
  }
}
