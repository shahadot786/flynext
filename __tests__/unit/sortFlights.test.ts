import { describe, test, expect } from 'vitest';
import { sortFlights } from '../../src/features/results/utils/sortFlights';
import type { Flight } from '../../src/shared/types';

const mockFlights: Flight[] = [
  {
    id: 'FL-CHEAP-FAST',
    segments: [
      {
        flightNumber: 'BG-1',
        airline: { code: 'BG', name: 'Biman', logo: '' },
        departure: { airport: { code: 'DAC', name: 'Dhaka', city: 'Dhaka', country: 'BD' }, time: '2026-06-20T08:00:00' },
        arrival: { airport: { code: 'CXB', name: 'Coxs Bazar', city: 'Coxs Bazar', country: 'BD' }, time: '2026-06-20T09:00:00' },
        durationMinutes: 60,
      },
    ],
    stops: [],
    totalDurationMinutes: 60,
    price: { amount: 4000, currency: 'BDT' },
    cabin: 'economy',
    seatsAvailable: 10,
  },
  {
    id: 'FL-EXPENSIVE-SLOW',
    segments: [
      {
        flightNumber: 'BG-2',
        airline: { code: 'BG', name: 'Biman', logo: '' },
        departure: { airport: { code: 'DAC', name: 'Dhaka', city: 'Dhaka', country: 'BD' }, time: '2026-06-20T10:00:00' },
        arrival: { airport: { code: 'CXB', name: 'Coxs Bazar', city: 'Coxs Bazar', country: 'BD' }, time: '2026-06-20T12:00:00' },
        durationMinutes: 120,
      },
    ],
    stops: [
      { airport: { code: 'CGP', name: 'Chittagong', city: 'Chittagong', country: 'BD' }, durationMinutes: 30 }
    ],
    totalDurationMinutes: 120,
    price: { amount: 9000, currency: 'BDT' },
    cabin: 'economy',
    seatsAvailable: 5,
  },
  {
    id: 'FL-MID-MID',
    segments: [
      {
        flightNumber: 'BG-3',
        airline: { code: 'BG', name: 'Biman', logo: '' },
        departure: { airport: { code: 'DAC', name: 'Dhaka', city: 'Dhaka', country: 'BD' }, time: '2026-06-20T06:00:00' },
        arrival: { airport: { code: 'CXB', name: 'Coxs Bazar', city: 'Coxs Bazar', country: 'BD' }, time: '2026-06-20T07:30:00' },
        durationMinutes: 90,
      },
    ],
    stops: [],
    totalDurationMinutes: 90,
    price: { amount: 6000, currency: 'BDT' },
    cabin: 'economy',
    seatsAvailable: 8,
  },
];

describe('sortFlights', () => {
  test('sorts by price_asc (low to high)', () => {
    const sorted = sortFlights(mockFlights, 'price_asc');
    expect(sorted[0]?.id).toBe('FL-CHEAP-FAST');
    expect(sorted[1]?.id).toBe('FL-MID-MID');
    expect(sorted[2]?.id).toBe('FL-EXPENSIVE-SLOW');
  });

  test('sorts by price_desc (high to low)', () => {
    const sorted = sortFlights(mockFlights, 'price_desc');
    expect(sorted[0]?.id).toBe('FL-EXPENSIVE-SLOW');
    expect(sorted[1]?.id).toBe('FL-MID-MID');
    expect(sorted[2]?.id).toBe('FL-CHEAP-FAST');
  });

  test('sorts by duration_asc (shortest duration first)', () => {
    const sorted = sortFlights(mockFlights, 'duration_asc');
    expect(sorted[0]?.id).toBe('FL-CHEAP-FAST');
    expect(sorted[1]?.id).toBe('FL-MID-MID');
    expect(sorted[2]?.id).toBe('FL-EXPENSIVE-SLOW');
  });

  test('sorts by departure_asc (earliest departure first)', () => {
    const sorted = sortFlights(mockFlights, 'departure_asc');
    expect(sorted[0]?.id).toBe('FL-MID-MID'); // departs at 06:00
    expect(sorted[1]?.id).toBe('FL-CHEAP-FAST'); // departs at 08:00
    expect(sorted[2]?.id).toBe('FL-EXPENSIVE-SLOW'); // departs at 10:00
  });

  test('sorts by departure_desc (latest departure first)', () => {
    const sorted = sortFlights(mockFlights, 'departure_desc');
    expect(sorted[0]?.id).toBe('FL-EXPENSIVE-SLOW');
    expect(sorted[1]?.id).toBe('FL-CHEAP-FAST');
    expect(sorted[2]?.id).toBe('FL-MID-MID');
  });

  test('sorts by stops_asc (fewest stops first)', () => {
    const sorted = sortFlights(mockFlights, 'stops_asc');
    expect(sorted[0]?.stops).toHaveLength(0);
    expect(sorted[1]?.stops).toHaveLength(0);
    expect(sorted[2]?.stops).toHaveLength(1);
  });
});
