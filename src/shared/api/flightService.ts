import type {
  Flight,
  FlightSearchParams,
  BookingRequest,
  BookingResponse,
} from "@/shared/types";

const API_BASE = "/api";

/**
 * Search for flights matching the given parameters.
 */
export async function searchFlights(
  params: FlightSearchParams,
): Promise<Flight[]> {
  const searchParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    adults: params.adults.toString(),
    children: params.children.toString(),
    kids: (params.kids ?? 0).toString(),
    infants: params.infants.toString(),
    cabin: params.cabin,
  });
  // if return date has a value added to this searchParams
  if (params.returnDate) {
    searchParams.append("returnDate", params.returnDate);
  }

  const response = await fetch(
    `${API_BASE}/flights?${searchParams.toString()}`,
  );
  //response error handle
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Search failed" }));
    throw new FlightSearchError(
      response.status,
      error.message ?? "Search failed",
    );
  }

  return response.json() as Promise<Flight[]>;
}

/**
 * Create a booking for a selected flight.
 */
export async function createBooking(
  data: BookingRequest,
): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  //response error handle
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Booking failed" }));
    throw new BookingError(response.status, error.message ?? "Booking failed");
  }

  return response.json() as Promise<BookingResponse>;
}

/**
 * Custom error class for flight search failures.
 */
export class FlightSearchError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "FlightSearchError";
  }
}

/**
 * Custom error class for booking failures.
 */
export class BookingError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BookingError";
  }
}
