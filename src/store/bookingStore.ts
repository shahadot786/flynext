import { create } from "zustand";
import type { Flight, PassengerCount } from "@/shared/types";

// ─── Booking Form Data Types ──────────────────────────────

import type {
  PassengerFormData,
  AddOnFormData as AddOnData,
  BaggageFormData as BaggageData,
  SeatFormData as SeatData,
  PaymentFormData as PaymentData,
} from "@/features/booking/schemas/bookingSchemas";

export type {
  PassengerFormData,
  AddOnData,
  BaggageData,
  SeatData,
  PaymentData,
};

export type BookingFormData = {
  passengers: PassengerFormData[];
  addOns: AddOnData[];
  baggage: BaggageData[];
  seats: SeatData[];
  payment: PaymentData;
};

// ─── Step Labels ──────────────────────────────────────────

export const BOOKING_STEPS = [
  { id: 1, label: "Booking Details", shortLabel: "BOOKING\nDETAILS" },
  { id: 2, label: "Add-On Services", shortLabel: "ADD-ON\nSERVICES" },
  { id: 3, label: "Extra Baggages", shortLabel: "EXTRA\nBAGGAGES" },
  { id: 4, label: "Seat Selection", shortLabel: "SEAT\nSELECTION" },
  { id: 5, label: "Review & Payment", shortLabel: "REVIEW &\nPAYMENT" },
] as const;

export const TOTAL_BOOKING_STEPS = BOOKING_STEPS.length;

// ─── Store State ───────────────────────────────────────────

type BookingState = {
  /** The flight the user selected from search results */
  selectedFlight: Flight | null;
  /** Passenger breakdown carried from search into booking */
  passengerCount: PassengerCount;
  /** Current step in the multi-step booking flow (1-based, max 5) */
  bookingStep: number;
  /** Persisted form data across steps */
  formData: BookingFormData;
  /** Timestamp when the booking session started */
  timerStartedAt: number | null;
  /** Tracks which steps have been completed */
  completedSteps: number[];
};

// ─── Store Actions ─────────────────────────────────────────

type BookingActions = {
  setSelectedFlight: (flight: Flight) => void;
  setPassengerCount: (count: PassengerCount) => void;
  setBookingStep: (step: number) => void;
  /** Advance to the next booking step (max TOTAL_BOOKING_STEPS) */
  nextStep: () => void;
  /** Go back to the previous booking step (min 1) */
  prevStep: () => void;
  /** Update form data for a specific section */
  updatePassengers: (passengers: PassengerFormData[]) => void;
  updateAddOns: (addOns: AddOnData[]) => void;
  updateBaggage: (baggage: BaggageData[]) => void;
  updateSeats: (seats: SeatData[]) => void;
  updatePayment: (payment: PaymentData) => void;
  /** Mark a step as completed */
  completeStep: (step: number) => void;
  /** Start the booking timer */
  startTimer: () => void;
  /** Clear all booking state — call after successful booking or when user abandons */
  resetBooking: () => void;
};

// ─── Initial Form Data ─────────────────────────────────────

const initialFormData: BookingFormData = {
  passengers: [],
  addOns: [],
  baggage: [],
  seats: [],
  payment: {
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  },
};

// ─── Initial State ─────────────────────────────────────────

const initialState: BookingState = {
  selectedFlight: null,
  passengerCount: { adults: 1, children: 0, kids: 0, infants: 0 },
  bookingStep: 1,
  formData: initialFormData,
  timerStartedAt: null,
  completedSteps: [],
};

// ─── Store ─────────────────────────────────────────────────

export const useBookingStore = create<BookingState & BookingActions>()(
  (set) => ({
    ...initialState,

    setSelectedFlight: (flight) => set({ selectedFlight: flight }),

    setPassengerCount: (count) => set({ passengerCount: count }),

    setBookingStep: (step) => set({ bookingStep: step }),

    nextStep: () =>
      set((state) => ({
        bookingStep: Math.min(TOTAL_BOOKING_STEPS, state.bookingStep + 1),
      })),

    prevStep: () =>
      set((state) => ({ bookingStep: Math.max(1, state.bookingStep - 1) })),

    updatePassengers: (passengers) =>
      set((state) => ({
        formData: { ...state.formData, passengers },
      })),

    updateAddOns: (addOns) =>
      set((state) => ({
        formData: { ...state.formData, addOns },
      })),

    updateBaggage: (baggage) =>
      set((state) => ({
        formData: { ...state.formData, baggage },
      })),

    updateSeats: (seats) =>
      set((state) => ({
        formData: { ...state.formData, seats },
      })),

    updatePayment: (payment) =>
      set((state) => ({
        formData: { ...state.formData, payment },
      })),

    completeStep: (step) =>
      set((state) => ({
        completedSteps: state.completedSteps.includes(step)
          ? state.completedSteps
          : [...state.completedSteps, step],
      })),

    startTimer: () =>
      set((state) => ({
        timerStartedAt: state.timerStartedAt ?? Date.now(),
      })),

    resetBooking: () => set(initialState),
  }),
);
