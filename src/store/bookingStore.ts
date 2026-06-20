import { create } from "zustand";
import type { Flight, PassengerCount } from "@/shared/types";

// ─── Store State ───────────────────────────────────────────

type BookingState = {
  /** The flight the user selected from search results */
  selectedFlight: Flight | null;
  /** Passenger breakdown carried from search into booking */
  passengerCount: PassengerCount;
  /** Current step in the multi-step booking flow (1-based) */
  bookingStep: number;
};

// ─── Store Actions ─────────────────────────────────────────

type BookingActions = {
  setSelectedFlight: (flight: Flight) => void;
  setPassengerCount: (count: PassengerCount) => void;
  setBookingStep: (step: number) => void;
  /** Advance to the next booking step */
  nextStep: () => void;
  /** Go back to the previous booking step (min 1) */
  prevStep: () => void;
  /** Clear all booking state — call after successful booking or when user abandons */
  resetBooking: () => void;
};

// ─── Initial State ─────────────────────────────────────────

const initialState: BookingState = {
  selectedFlight: null,
  passengerCount: { adults: 1, children: 0, kids: 0, infants: 0 },
  bookingStep: 1,
};

// ─── Store ─────────────────────────────────────────────────

export const useBookingStore = create<BookingState & BookingActions>()(
  (set) => ({
    ...initialState,

    setSelectedFlight: (flight) => set({ selectedFlight: flight }),

    setPassengerCount: (count) => set({ passengerCount: count }),

    setBookingStep: (step) => set({ bookingStep: step }),

    nextStep: () => set((state) => ({ bookingStep: state.bookingStep + 1 })),

    prevStep: () =>
      set((state) => ({ bookingStep: Math.max(1, state.bookingStep - 1) })),

    resetBooking: () => set(initialState),
  }),
);
