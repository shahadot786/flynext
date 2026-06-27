import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Duffel } from "@duffel/api";
import { FlightSchema, CabinClassSchema } from "@/shared/types";

const duffel = new Duffel({
  token: process.env.NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN || "",
});

const BookingBodySchema = z.object({
  flightId: z.string().min(1, "Flight ID is required"),
  passengers: z
    .array(
      z.object({
        type: z.enum(["adult", "child", "infant"]),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        dateOfBirth: z.string(),
        nationality: z.string().min(2),
        gender: z.enum(["male", "female", "other"]).optional(),
        passportNumber: z.string().optional(),
        passportExpiry: z.string().optional(),
      }),
    )
    .min(1, "At least one passenger is required"),
  extras: z
    .array(
      z.object({
        mealType: z
          .enum(["standard", "vegetarian", "vegan", "halal", "kosher", "none"])
          .default("standard"),
        wheelchairRequired: z.boolean().default(false),
        wheelchairNotes: z.string().optional(),
      }),
    )
    .optional(),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().min(11),
  }),
  payment: z.object({
    cardLast4: z.string().length(4),
  }),
  idempotencyKey: z.string().uuid(),
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

// Simple in-memory idempotency store (reset on server restart)
const processedKeys = new Map<string, object>();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = BookingBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { flightId, passengers, contactInfo, idempotencyKey } = parsed.data;

  // Idempotency check — return same response for duplicate key
  const existingResponse = processedKeys.get(idempotencyKey);
  if (existingResponse) {
    return NextResponse.json(existingResponse);
  }

  if (!process.env.NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN) {
    return NextResponse.json(
      { message: "Duffel access token is not configured in .env.local" },
      { status: 500 },
    );
  }

  try {
    // 1. Fetch Selected Offer Details from Duffel
    const offerResponse = await duffel.offers.get(flightId);
    const offer = offerResponse.data;

    if (!offer) {
      return NextResponse.json({ message: "Offer not found on Duffel" }, { status: 404 });
    }

    // 2. Map frontend passengers to Duffel passenger IDs
    const duffelOfferPassengers = offer.passengers || [];

    const duffelAdults = duffelOfferPassengers.filter((p) => p.type === "adult");
    const duffelChildren = duffelOfferPassengers.filter((p) => p.type === "child");
    const duffelInfants = duffelOfferPassengers.filter((p) => p.type === "infant_without_seat");

    const inputAdults = passengers.filter((p) => p.type === "adult");
    const inputChildren = passengers.filter((p) => p.type === "child");
    const inputInfants = passengers.filter((p) => p.type === "infant");

    const mappedPassengers: Array<{
      id: string;
      given_name: string;
      family_name: string;
      born_on: string;
      gender: "m" | "f";
      title: "mr" | "ms" | "mrs" | "miss" | "dr";
      email: string;
      phone_number: string;
    }> = [];

    // Clean phone number for E.164
    let cleanPhone = contactInfo.phone.replace(/\s+/g, "");
    if (!cleanPhone.startsWith("+")) {
      if (cleanPhone.startsWith("0")) {
        cleanPhone = `+88${cleanPhone}`;
      } else if (cleanPhone.startsWith("880")) {
        cleanPhone = `+${cleanPhone}`;
      } else {
        cleanPhone = `+880${cleanPhone}`;
      }
    }

    // Map adults
    duffelAdults.forEach((da, idx) => {
      const input = inputAdults[idx] || inputAdults[0];
      if (input) {
        const gender = input.gender === "female" ? "f" : "m";
        const title = input.gender === "female" ? "ms" : "mr";

        mappedPassengers.push({
          id: da.id,
          given_name: input.firstName,
          family_name: input.lastName,
          born_on: input.dateOfBirth,
          gender,
          title,
          email: contactInfo.email,
          phone_number: cleanPhone,
        });
      }
    });

    // Map children
    duffelChildren.forEach((dc, idx) => {
      const input = inputChildren[idx] || inputChildren[0];
      if (input) {
        const gender = input.gender === "female" ? "f" : "m";
        const title = input.gender === "female" ? "miss" : "mr";

        mappedPassengers.push({
          id: dc.id,
          given_name: input.firstName,
          family_name: input.lastName,
          born_on: input.dateOfBirth,
          gender,
          title,
          email: contactInfo.email,
          phone_number: cleanPhone,
        });
      }
    });

    // Map infants
    duffelInfants.forEach((di, idx) => {
      const input = inputInfants[idx] || inputInfants[0];
      if (input) {
        const gender = input.gender === "female" ? "f" : "m";
        const title = input.gender === "female" ? "miss" : "mr";

        mappedPassengers.push({
          id: di.id,
          given_name: input.firstName,
          family_name: input.lastName,
          born_on: input.dateOfBirth,
          gender,
          title,
          email: contactInfo.email,
          phone_number: cleanPhone,
        });
      }
    });

    // 3. Create Duffel sandbox order
    const orderResponse = await duffel.orders.create({
      type: "instant",
      selected_offers: [flightId],
      payments: [
        {
          type: "balance",
          amount: offer.total_amount,
          currency: offer.total_currency,
        },
      ],
      passengers: mappedPassengers,
    });

    const order = orderResponse.data;

    type Flight = z.infer<typeof FlightSchema>;
    const segments: Flight["segments"] = [];
    const stops: Flight["stops"] = [];
    let totalDurationMinutes = 0;

    offer.slices.forEach((slice) => {
      const sliceSegments = slice.segments || [];

      // Calculate stops/layovers
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

    const mappedFlight = {
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

    const bookingResponse = {
      bookingId: order.id,
      status: "confirmed" as const,
      flight: mappedFlight,
      totalPrice: { amount: convertedPrice * passengers.length, currency: "BDT" },
      createdAt: order.created_at || new Date().toISOString(),
    };

    // Store for idempotency
    processedKeys.set(idempotencyKey, bookingResponse);

    return NextResponse.json(bookingResponse, { status: 201 });
  } catch (error) {
    console.error("Duffel Booking Error:", error);
    const duffelErr = error as {
      meta?: { status?: number };
      errors?: Array<{ message?: string }>;
      message?: string;
    };
    const status = duffelErr.meta?.status || 500;
    const message = duffelErr.errors?.[0]?.message || duffelErr.message || "Failed to create booking on Duffel";
    return NextResponse.json(
      { message },
      { status },
    );
  }
}
