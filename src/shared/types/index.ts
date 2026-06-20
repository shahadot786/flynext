import { z } from 'zod';

// ─── Airport ───────────────────────────────────────────────

export const AirportSchema = z.object({
  code: z.string().length(3),
  name: z.string(),
  city: z.string(),
  country: z.string(),
});

export type Airport = z.infer<typeof AirportSchema>;

// ─── Airline ───────────────────────────────────────────────

export const AirlineSchema = z.object({
  code: z.string().min(2).max(3),
  name: z.string(),
  logo: z.string(),
});

export type Airline = z.infer<typeof AirlineSchema>;

// ─── Money ─────────────────────────────────────────────────

export const MoneySchema = z.object({
  amount: z.number(),
  currency: z.string().default('BDT'),
});

export type Money = z.infer<typeof MoneySchema>;

// ─── Flight Segment ────────────────────────────────────────

export const FlightSegmentSchema = z.object({
  flightNumber: z.string(),
  airline: AirlineSchema,
  departure: z.object({
    airport: AirportSchema,
    time: z.string(), // ISO datetime
  }),
  arrival: z.object({
    airport: AirportSchema,
    time: z.string(), // ISO datetime
  }),
  durationMinutes: z.number(),
});

export type FlightSegment = z.infer<typeof FlightSegmentSchema>;

// ─── Flight ────────────────────────────────────────────────

export const CabinClassSchema = z.enum(['economy', 'business', 'first']);
export type CabinClass = z.infer<typeof CabinClassSchema>;

export const FlightSchema = z.object({
  id: z.string(),
  segments: z.array(FlightSegmentSchema).min(1),
  stops: z.array(
    z.object({
      airport: AirportSchema,
      durationMinutes: z.number(),
    })
  ),
  totalDurationMinutes: z.number(),
  price: MoneySchema,
  cabin: CabinClassSchema,
  seatsAvailable: z.number(),
});

export type Flight = z.infer<typeof FlightSchema>;

// ─── Passenger ─────────────────────────────────────────────

export const PassengerTypeSchema = z.enum(['adult', 'child', 'infant']);
export type PassengerType = z.infer<typeof PassengerTypeSchema>;

export const PassengerSchema = z.object({
  type: PassengerTypeSchema,
  firstName: z.string().min(2, 'At least 2 characters').max(100, 'Too long'),
  lastName: z.string().min(2, 'At least 2 characters').max(50, 'Too long'),
  dateOfBirth: z.string(),
  nationality: z.string().min(2, 'Required'),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
});

export type Passenger = z.infer<typeof PassengerSchema>;

// ─── Passenger Count ───────────────────────────────────────

export const PassengerCountSchema = z.object({
  adults: z.number().min(1).max(9),
  children: z.number().min(0).max(9),
  infants: z.number().min(0).max(9),
});

export type PassengerCount = z.infer<typeof PassengerCountSchema>;

// ─── Meal & Extras ─────────────────────────────────────────

export const MealTypeSchema = z.enum([
  'standard',
  'vegetarian',
  'vegan',
  'halal',
  'kosher',
  'none',
]);
export type MealType = z.infer<typeof MealTypeSchema>;

export const PassengerExtrasSchema = z.object({
  mealType: MealTypeSchema.default('standard'),
  wheelchairRequired: z.boolean().default(false),
  wheelchairNotes: z.string().optional(),
});

export type PassengerExtras = z.infer<typeof PassengerExtrasSchema>;

// ─── Contact Info ──────────────────────────────────────────

export const ContactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(11, 'Phone number too short')
    .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number'),
});

export type ContactInfo = z.infer<typeof ContactInfoSchema>;

// ─── Booking ───────────────────────────────────────────────

export const BookingStatusSchema = z.enum(['confirmed', 'pending', 'cancelled']);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  id: z.string(),
  status: BookingStatusSchema,
  flight: FlightSchema,
  passengers: z.array(PassengerSchema),
  extras: z.array(PassengerExtrasSchema),
  contactInfo: ContactInfoSchema,
  totalPrice: MoneySchema,
  createdAt: z.string(),
});

export type Booking = z.infer<typeof BookingSchema>;

// ─── Booking Request ───────────────────────────────────────

export const BookingRequestSchema = z.object({
  flightId: z.string(),
  passengers: z.array(PassengerSchema),
  extras: z.array(PassengerExtrasSchema),
  contactInfo: ContactInfoSchema,
  payment: z.object({
    cardLast4: z.string().length(4),
  }),
  idempotencyKey: z.string().uuid(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;

// ─── Booking Response ──────────────────────────────────────

export const BookingResponseSchema = z.object({
  bookingId: z.string(),
  status: BookingStatusSchema,
  flight: FlightSchema,
  totalPrice: MoneySchema,
  createdAt: z.string(),
});

export type BookingResponse = z.infer<typeof BookingResponseSchema>;

// ─── Filters & Sorting ────────────────────────────────────

export const TimeRangeSchema = z.enum(['morning', 'afternoon', 'evening']);
export type TimeRange = z.infer<typeof TimeRangeSchema>;

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  morning: '06:00 – 12:00',
  afternoon: '12:00 – 18:00',
  evening: '18:00 – 24:00',
};

export const TIME_RANGE_HOURS: Record<TimeRange, [number, number]> = {
  morning: [6, 12],
  afternoon: [12, 18],
  evening: [18, 24],
};

export type FlightFilters = {
  stops: number[] | null; // null = no filter, [0] = non-stop, [0, 1] = 0 or 1 stop
  priceRange: [number, number] | null;
  airlines: string[]; // airline codes, empty = all
  departureTimeRanges: TimeRange[];
  arrivalTimeRanges: TimeRange[];
};

export const DEFAULT_FILTERS: FlightFilters = {
  stops: null,
  priceRange: null,
  airlines: [],
  departureTimeRanges: [],
  arrivalTimeRanges: [],
};

export const SortOptionSchema = z.enum([
  'price_asc',
  'price_desc',
  'duration_asc',
  'departure_asc',
  'departure_desc',
]);
export type SortOption = z.infer<typeof SortOptionSchema>;

export const SORT_LABELS: Record<SortOption, string> = {
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  duration_asc: 'Duration: Shortest',
  departure_asc: 'Departure: Earliest',
  departure_desc: 'Departure: Latest',
};

// ─── Search Params ─────────────────────────────────────────

export type FlightSearchParams = {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
};

// ─── Error Types ───────────────────────────────────────────

export type ErrorSeverity = 'recoverable' | 'partial' | 'fatal';

export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Please check your search and try again.',
  404: 'No flights found for this route.',
  409: 'Sorry, this seat is no longer available. Please select another flight.',
  500: 'Something went wrong on our end. We\'re working on it.',
  503: 'Flight search is temporarily unavailable. Please try again in a moment.',
};
