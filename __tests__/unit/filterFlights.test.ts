import { describe, test, expect } from 'vitest';
import { filterFlights, _testExports } from '../../src/features/results/utils/filterFlights';
import type { Flight, FlightFilters } from '../../src/shared/types';

// Mock flight data for testing
const mockFlights: Flight[] = [
  {
    id: 'FL-001',
    segments: [
      {
        flightNumber: 'BG-101',
        airline: { code: 'BG', name: 'Biman', logo: '' },
        departure: { airport: { code: 'DAC', name: 'Dhaka', city: 'Dhaka', country: 'BD' }, time: '2026-06-20T08:30:00' },
        arrival: { airport: { code: 'CXB', name: 'Coxs Bazar', city: 'Coxs Bazar', country: 'BD' }, time: '2026-06-20T09:40:00' },
        durationMinutes: 70,
      },
    ],
    stops: [],
    totalDurationMinutes: 70,
    price: { amount: 5000, currency: 'BDT' },
    cabin: 'economy',
    seatsAvailable: 10,
  },
  {
    id: 'FL-002',
    segments: [
      {
        flightNumber: 'BS-201',
        airline: { code: 'BS', name: 'US-Bangla', logo: '' },
        departure: { airport: { code: 'DAC', name: 'Dhaka', city: 'Dhaka', country: 'BD' }, time: '2026-06-20T14:30:00' },
        arrival: { airport: { code: 'CGP', name: 'Chittagong', city: 'Chittagong', country: 'BD' }, time: '2026-06-20T15:15:00' },
        durationMinutes: 45,
      },
      {
        flightNumber: 'BS-202',
        airline: { code: 'BS', name: 'US-Bangla', logo: '' },
        departure: { airport: { code: 'CGP', name: 'Chittagong', city: 'Chittagong', country: 'BD' }, time: '2026-06-20T16:15:00' },
        arrival: { airport: { code: 'CXB', name: 'Coxs Bazar', city: 'Coxs Bazar', country: 'BD' }, time: '2026-06-20T17:00:00' },
        durationMinutes: 45,
      },
    ],
    stops: [
      {
        airport: { code: 'CGP', name: 'Chittagong', city: 'Chittagong', country: 'BD' },
        durationMinutes: 60,
      },
    ],
    totalDurationMinutes: 150,
    price: { amount: 8000, currency: 'BDT' },
    cabin: 'economy',
    seatsAvailable: 5,
  },
];

const defaultFilters: FlightFilters = {
  stops: null,
  priceRange: null,
  airlines: [],
  departureTimeRanges: [],
  arrivalTimeRanges: [],
};

describe('filterFlights', () => {
  test('returns all flights when default (empty) filters are active', () => {
    const result = filterFlights(mockFlights, defaultFilters);
    expect(result).toHaveLength(2);
  });

  test('filters by stops count', () => {
    const nonStopFilter: FlightFilters = { ...defaultFilters, stops: [0] };
    const oneStopFilter: FlightFilters = { ...defaultFilters, stops: [1] };

    expect(filterFlights(mockFlights, nonStopFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, nonStopFilter)[0]?.id).toBe('FL-001');

    expect(filterFlights(mockFlights, oneStopFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, oneStopFilter)[0]?.id).toBe('FL-002');
  });

  test('filters by price range', () => {
    const lowBudget: FlightFilters = { ...defaultFilters, priceRange: [4000, 6000] };
    const highBudget: FlightFilters = { ...defaultFilters, priceRange: [7000, 9000] };

    expect(filterFlights(mockFlights, lowBudget)).toHaveLength(1);
    expect(filterFlights(mockFlights, lowBudget)[0]?.id).toBe('FL-001');

    expect(filterFlights(mockFlights, highBudget)).toHaveLength(1);
    expect(filterFlights(mockFlights, highBudget)[0]?.id).toBe('FL-002');
  });

  test('filters by airline code', () => {
    const bimanFilter: FlightFilters = { ...defaultFilters, airlines: ['BG'] };
    const usBanglaFilter: FlightFilters = { ...defaultFilters, airlines: ['BS'] };

    expect(filterFlights(mockFlights, bimanFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, bimanFilter)[0]?.id).toBe('FL-001');

    expect(filterFlights(mockFlights, usBanglaFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, usBanglaFilter)[0]?.id).toBe('FL-002');
  });

  test('filters by departure time range', () => {
    // FL-001 departs at 08:30 (Morning: 06:00-12:00)
    // FL-002 departs at 14:30 (Afternoon: 12:00-18:00)
    const morningFilter: FlightFilters = { ...defaultFilters, departureTimeRanges: ['morning'] };
    const afternoonFilter: FlightFilters = { ...defaultFilters, departureTimeRanges: ['afternoon'] };

    expect(filterFlights(mockFlights, morningFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, morningFilter)[0]?.id).toBe('FL-001');

    expect(filterFlights(mockFlights, afternoonFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, afternoonFilter)[0]?.id).toBe('FL-002');
  });

  test('filters by arrival time range', () => {
    // FL-001 arrives at 09:40 (Morning: 06:00-12:00)
    // FL-002 arrives at 17:00 (Afternoon: 12:00-18:00)
    const morningFilter: FlightFilters = { ...defaultFilters, arrivalTimeRanges: ['morning'] };
    const afternoonFilter: FlightFilters = { ...defaultFilters, arrivalTimeRanges: ['afternoon'] };

    expect(filterFlights(mockFlights, morningFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, morningFilter)[0]?.id).toBe('FL-001');

    expect(filterFlights(mockFlights, afternoonFilter)).toHaveLength(1);
    expect(filterFlights(mockFlights, afternoonFilter)[0]?.id).toBe('FL-002');
  });
});

describe('individual predicates', () => {
  test('matchesStops predicate', () => {
    const { matchesStops } = _testExports;
    expect(matchesStops(mockFlights[0]!, null)).toBe(true);
    expect(matchesStops(mockFlights[0]!, [0])).toBe(true);
    expect(matchesStops(mockFlights[0]!, [1])).toBe(false);
  });

  test('matchesPriceRange predicate', () => {
    const { matchesPriceRange } = _testExports;
    expect(matchesPriceRange(mockFlights[0]!, null)).toBe(true);
    expect(matchesPriceRange(mockFlights[0]!, [4000, 6000])).toBe(true);
    expect(matchesPriceRange(mockFlights[0]!, [6000, 8000])).toBe(false);
  });
});
