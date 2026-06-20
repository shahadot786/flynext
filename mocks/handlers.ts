import { http, HttpResponse } from 'msw';
import flightsData from '../src/data/flights.json';
import type { Flight } from '../src/shared/types';

export const handlers = [
  // intercept GET /api/flights
  http.get('/api/flights', ({ request }) => {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin')?.toUpperCase();
    const destination = url.searchParams.get('destination')?.toUpperCase();
    const cabin = url.searchParams.get('cabin');
    const simulateError = url.searchParams.get('simulate_error');

    if (simulateError) {
      return new HttpResponse(
        JSON.stringify({ message: 'Simulated error' }),
        { status: Number(simulateError), headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!origin || !destination) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid search parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('flightsData is array?', Array.isArray(flightsData), typeof flightsData, 'length:', flightsData?.length);
    console.log('MSW /api/flights called with:', { origin, destination, cabin });
    const filtered = (flightsData as Flight[]).filter((flight) => {
      const firstSegment = flight.segments[0];
      const lastSegment = flight.segments[flight.segments.length - 1];

      const matchesOrigin = firstSegment?.departure?.airport?.code === origin;
      const matchesDest = lastSegment?.arrival?.airport?.code === destination;
      const matchesCabin = flight.cabin === cabin;

      console.log('Checking flight:', flight.id, {
        matchesOrigin,
        matchesDest,
        matchesCabin,
        flightOrigin: firstSegment?.departure?.airport?.code,
        flightDest: lastSegment?.arrival?.airport?.code,
        flightCabin: flight.cabin,
        searchOrigin: origin,
        searchDest: destination,
        searchCabin: cabin
      });

      return matchesOrigin && matchesDest && (cabin ? matchesCabin : true);
    });
    console.log('MSW filtered result count:', filtered.length);

    return HttpResponse.json(filtered);
  }),

  // intercept POST /api/bookings
  http.post('/api/bookings', async ({ request }) => {
    const body = (await request.json()) as { flightId: string; passengers: unknown[] };
    const { flightId, passengers } = body;

    const flight = (flightsData as Flight[]).find((f) => f.id === flightId);
    if (!flight) {
      return new HttpResponse(
        JSON.stringify({ message: 'Flight not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const totalAmount = flight.price.amount * passengers.length;

    const bookingResponse = {
      bookingId: 'BK-2026-TESTID',
      status: 'confirmed',
      flight,
      totalPrice: { amount: totalAmount, currency: 'BDT' },
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(bookingResponse, { status: 201 });
  }),
];
