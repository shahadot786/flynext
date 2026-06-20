import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeAll } from "vitest";
import { BookingForm } from "../../src/features/booking/components/BookingForm";
import { useBookingStore } from "../../src/store/bookingStore";

// Mock Next.js navigation locally to capture router calls
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}));

const mockFlight = {
  id: "FL-001",
  segments: [
    {
      flightNumber: "BG-347",
      airline: {
        code: "BG",
        name: "Biman Bangladesh Airlines",
        logo: "/airlines/bg.svg",
      },
      departure: {
        airport: {
          code: "DAC",
          name: "Hazrat Shahjalal International Airport",
          city: "Dhaka",
          country: "Bangladesh",
        },
        time: "2026-07-01T08:00:00",
      },
      arrival: {
        airport: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "UAE",
        },
        time: "2026-07-01T12:30:00",
      },
      durationMinutes: 330,
    },
  ],
  stops: [],
  totalDurationMinutes: 330,
  price: { amount: 32500, currency: "BDT" },
  cabin: "economy" as const,
  seatsAvailable: 14,
};

describe("BookingFlow Integration", () => {
  beforeAll(() => {
    // Reset store before starting
    useBookingStore.getState().resetBooking();
  });

  test("walks through the entire 5-step booking flow and completes booking", async () => {
    // Set selected flight and passengers in store
    useBookingStore.getState().setSelectedFlight(mockFlight);
    useBookingStore
      .getState()
      .setPassengerCount({ adults: 1, children: 0, kids: 0, infants: 0 });

    render(<BookingForm />);

    // ────────────────────────────────────────────────────────
    // Step 1: Passenger Details
    // ────────────────────────────────────────────────────────
    expect(screen.getByText(/Provide Passenger Details/i)).toBeInTheDocument();

    // Click Demo Details to fill form
    const demoDetailsBtn = screen.getByText(/Demo Details/i);
    fireEvent.click(demoDetailsBtn);

    // Click "Save & Continue" to go to Step 2
    const nextBtn1 = screen.getByRole("button", { name: /Save & Continue/i });
    fireEvent.click(nextBtn1);

    // ────────────────────────────────────────────────────────
    // Step 2: Add-On Services
    // ────────────────────────────────────────────────────────
    await waitFor(
      () => {
        expect(screen.getAllByText(/Meal Preference/i)[0]).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const nextBtn2 = screen.getByRole("button", { name: /Save & Continue/i });
    fireEvent.click(nextBtn2);

    // ────────────────────────────────────────────────────────
    // Step 3: Extra Baggage
    // ────────────────────────────────────────────────────────
    await waitFor(
      () => {
        expect(screen.getAllByText(/Extra Baggage/i)[0]).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const nextBtn3 = screen.getByRole("button", { name: /Save & Continue/i });
    fireEvent.click(nextBtn3);

    // ────────────────────────────────────────────────────────
    // Step 4: Seat Selection
    // ────────────────────────────────────────────────────────
    await waitFor(
      () => {
        expect(screen.getAllByText(/Seat Selection/i)[0]).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const nextBtn4 = screen.getByRole("button", { name: /Save & Continue/i });
    fireEvent.click(nextBtn4);

    // ────────────────────────────────────────────────────────
    // Step 5: Review & Payment
    // ────────────────────────────────────────────────────────
    await waitFor(
      () => {
        expect(screen.getAllByText(/Review & Payment/i)[0]).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Auto-fill demo card details
    const demoCardBtn = screen.getByRole("button", { name: /Use Demo Card/i });
    fireEvent.click(demoCardBtn);

    // Agree to terms checkbox
    const termsCheckbox = screen.getByRole("checkbox");
    fireEvent.click(termsCheckbox);

    // Click Confirm & Pay (there's a desktop submit button inside the form)
    const confirmBtn = screen.getAllByRole("button", {
      name: /Confirm & Pay/i,
    })[0];
    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    // Verify loading state or redirect callback
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("/booking/confirmation/"),
        );
      },
      { timeout: 3000 },
    );
  });
});
