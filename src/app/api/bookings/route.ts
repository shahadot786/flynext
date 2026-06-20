import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import flightsData from "@/data/flights.json";
import { FlightSchema } from "@/shared/types";

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

  const { flightId, passengers, idempotencyKey } = parsed.data;

  // Idempotency check — return same response for duplicate key
  const existingResponse = processedKeys.get(idempotencyKey);
  if (existingResponse) {
    return NextResponse.json(existingResponse);
  }

  // Find the flight
  type Flight = z.infer<typeof FlightSchema>;
  const flight = (flightsData as Flight[]).find((f) => f.id === flightId);

  if (!flight) {
    return NextResponse.json({ message: "Flight not found" }, { status: 404 });
  }

  // Simulate seat availability check (10% chance of 409)
  if (Math.random() < 0.1 && flight.seatsAvailable < passengers.length) {
    return NextResponse.json(
      {
        message:
          "Sorry, this seat is no longer available. Please select another flight.",
      },
      { status: 409 },
    );
  }

  // Simulate processing delay (500-1500ms for payment processing feel)
  await new Promise((resolve) =>
    setTimeout(resolve, 500 + Math.random() * 1000),
  );

  // Calculate total price
  const totalAmount = flight.price.amount * passengers.length;

  const bookingResponse = {
    bookingId: `BK-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    status: "confirmed" as const,
    flight,
    totalPrice: { amount: totalAmount, currency: "BDT" },
    createdAt: new Date().toISOString(),
  };

  // Store for idempotency
  processedKeys.set(idempotencyKey, bookingResponse);

  return NextResponse.json(bookingResponse, { status: 201 });
}
