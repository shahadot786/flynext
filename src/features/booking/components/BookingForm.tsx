"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import {
  useBookingStore,
  BOOKING_STEPS,
  TOTAL_BOOKING_STEPS,
} from "@/store/bookingStore";
import type {
  PassengerFormData,
  AddOnData,
  BaggageData,
  SeatData,
  PaymentData,
} from "@/store/bookingStore";
import { BookingProgress } from "./BookingProgress";
import { FlightSummaryCard, MobileBottomBar } from "./FlightSummaryCard";
import { PassengerForm } from "./PassengerForm";
import { AddOnServicesForm } from "./AddOnServicesForm";
import { ExtraBaggageForm } from "./ExtraBaggageForm";
import { SeatSelectionForm } from "./SeatSelectionForm";
import { ReviewPaymentForm } from "./ReviewPaymentForm";
import { createBooking } from "@/shared/api/flightService";
import insuranceData from "@/data/insurance.json";
import baggageData from "@/data/baggageOptions.json";
import { SessionTimer } from "@/shared/components/SessionTimer";
import { SessionExpiredModal } from "@/shared/components/SessionExpiredModal";

// ─── Step Titles ───────────────────────────────────────────

const STEP_TITLES = [
  "Provide Passenger Details",
  "Add-On Services",
  "Extra Baggage",
  "Seat Selection",
  "Review & Payment",
];

// ─── Component ─────────────────────────────────────────────

export function BookingForm() {
  const router = useRouter();
  const {
    selectedFlight,
    passengerCount,
    bookingStep,
    setBookingStep,
    formData,
    timerStartedAt,
    completedSteps,
    nextStep,
    prevStep,
    completeStep,
    startTimer,
    resetBooking,
    updatePassengers,
    updateAddOns,
    updateBaggage,
    updateSeats,
    updatePayment,
  } = useBookingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Start timer on mount
  useEffect(() => {
    startTimer();
  }, [startTimer]);

  // Build passenger labels
  const passengerLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < passengerCount.adults; i++)
      labels.push(`Adult ${i + 1}`);
    for (let i = 0; i < passengerCount.children; i++)
      labels.push(`Child ${i + 1}`);
    for (let i = 0; i < passengerCount.kids; i++) labels.push(`Kid ${i + 1}`);
    for (let i = 0; i < passengerCount.infants; i++)
      labels.push(`Infant ${i + 1}`);
    return labels;
  }, [passengerCount]);

  // Calculate extra charges for price display
  const extraCharges = useMemo(() => {
    const insTotal = formData.addOns.reduce((sum, ao) => {
      const ins = insuranceData.find((i) => i.id === ao.insuranceId);
      return sum + (ins?.price.amount ?? 0);
    }, 0);
    const bagTotal = formData.baggage.reduce((sum, b) => {
      const bag = baggageData.find((bo) => bo.id === b.extraBaggageId);
      return sum + (bag?.price.amount ?? 0);
    }, 0);
    return insTotal + bagTotal;
  }, [formData.addOns, formData.baggage]);

  // ── Step Handlers ──────────────────────────────────

  const handlePassengerSubmit = useCallback(
    (data: PassengerFormData[]) => {
      updatePassengers(data);
      completeStep(1);
      nextStep();
    },
    [updatePassengers, completeStep, nextStep],
  );

  const handleAddOnSubmit = useCallback(
    (data: AddOnData[]) => {
      updateAddOns(data);
      completeStep(2);
      nextStep();
    },
    [updateAddOns, completeStep, nextStep],
  );

  const handleBaggageSubmit = useCallback(
    (data: BaggageData[]) => {
      updateBaggage(data);
      completeStep(3);
      nextStep();
    },
    [updateBaggage, completeStep, nextStep],
  );

  const handleSeatSubmit = useCallback(
    (data: SeatData[]) => {
      updateSeats(data);
      completeStep(4);
      nextStep();
    },
    [updateSeats, completeStep, nextStep],
  );

  const handlePaymentSubmit = useCallback(
    async (payment: PaymentData) => {
      if (!selectedFlight) return;
      setIsSubmitting(true);
      updatePayment(payment);

      try {
        // Build passenger data for the API
        const apiPassengers = formData.passengers.map((p, i) => ({
          type: (i < passengerCount.adults
            ? "adult"
            : i < passengerCount.adults + passengerCount.children
              ? "child"
              : "infant") as "adult" | "child" | "infant",
          firstName: p.givenName,
          lastName: p.surname,
          dateOfBirth: p.dateOfBirth,
          nationality: p.nationality,
          gender: p.gender,
        }));

        const apiExtras = formData.addOns.map((ao) => ({
          mealType: ao.mealType as
            | "standard"
            | "vegetarian"
            | "vegan"
            | "halal"
            | "kosher"
            | "none",
          wheelchairRequired: ao.wheelchairRequired,
        }));

        const response = await createBooking({
          flightId: selectedFlight.id,
          passengers: apiPassengers,
          extras: apiExtras,
          contactInfo: {
            email: formData.passengers[0]?.email ?? "",
            phone: `${formData.passengers[0]?.phoneCode ?? ""}${formData.passengers[0]?.phoneNumber ?? ""}`,
          },
          payment: { cardLast4: payment.cardNumber.slice(-4) },
          idempotencyKey: crypto.randomUUID(),
        });

        // Save booking data to localStorage
        if (typeof window !== "undefined") {
          try {
            const bookingsStr = localStorage.getItem(
              "flynext_bookings_demo_data",
            );
            const bookings = bookingsStr ? JSON.parse(bookingsStr) : [];

            const adultTotal =
              passengerCount.adults * selectedFlight.price.amount;
            const childTotal =
              passengerCount.children *
              Math.round(selectedFlight.price.amount * 0.75);
            const kidsTotal =
              passengerCount.kids *
              Math.round(selectedFlight.price.amount * 0.75);
            const infantTotal =
              passengerCount.infants *
              Math.round(selectedFlight.price.amount * 0.1);
            const subtotal = adultTotal + childTotal + kidsTotal + infantTotal;
            const discount = Math.round(selectedFlight.price.amount * 0.06);
            const totalPrice = subtotal - discount + 108 + extraCharges;

            const newBooking = {
              bookingId: response.bookingId,
              flight: selectedFlight,
              passengerCount,
              formData: {
                ...formData,
                payment: {
                  cardholderName: payment.cardholderName,
                  cardNumber: `•••• •••• •••• ${payment.cardNumber.slice(-4)}`,
                  expiryDate: payment.expiryDate,
                  cvv: "•••",
                },
              },
              createdAt: new Date().toISOString(),
              totalPrice,
            };
            localStorage.setItem(
              "flynext_bookings_demo_data",
              JSON.stringify([newBooking, ...bookings]),
            );
          } catch (e) {
            console.error("Failed to save booking to localStorage", e);
          }
        }

        completeStep(5);
        router.push(`/booking/confirmation/${response.bookingId}`);
      } catch {
        setIsSubmitting(false);
        // Error will be handled by the form
      }
    },
    [
      selectedFlight,
      formData,
      passengerCount,
      extraCharges,
      updatePayment,
      completeStep,
      router,
    ],
  );

  // ── Next/Back for mobile bottom bar ────────────────
  const handleNext = useCallback(() => {
    switch (bookingStep) {
      case 1: {
        // Trigger the passenger form submit
        const form = document.getElementById(
          "passenger-form",
        ) as HTMLFormElement | null;
        form?.requestSubmit();
        break;
      }
      case 2: {
        const btn = document.getElementById(
          "addon-submit",
        ) as HTMLButtonElement | null;
        btn?.click();
        break;
      }
      case 3: {
        const btn = document.getElementById(
          "baggage-submit",
        ) as HTMLButtonElement | null;
        btn?.click();
        break;
      }
      case 4: {
        const btn = document.getElementById(
          "seat-submit",
        ) as HTMLButtonElement | null;
        btn?.click();
        break;
      }
      case 5: {
        const form = document.getElementById(
          "payment-form",
        ) as HTMLFormElement | null;
        form?.requestSubmit();
        break;
      }
    }
  }, [bookingStep]);

  if (!selectedFlight) return null;

  const currentStepLabel = STEP_TITLES[bookingStep - 1] ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Mobile Header ───────────────────────────── */}
      <div className="lg:hidden">
        {/* Blue title bar */}
        <div className="bg-primary-600 text-white px-4 py-3.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-white hover:text-blue-100 transition-colors cursor-pointer select-none"
            aria-label="Go back"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <div>
            <p className="text-[10px] font-semibold text-blue-200 leading-none">
              {bookingStep === 1 ? "Provide Details of" : ""}
            </p>
            <h1 className="text-base font-extrabold leading-tight mt-0.5">
              {bookingStep === 1
                ? `Passenger ${passengerLabels.length > 0 ? 1 : ""}`
                : currentStepLabel}
            </h1>
          </div>
        </div>

        {/* Timer */}
        {timerStartedAt && (
          <SessionTimer
            startedAt={timerStartedAt}
            onExpire={() => setIsSessionExpired(true)}
            variant="bar"
          />
        )}

        {/* Progress */}
        <BookingProgress
          currentStep={bookingStep}
          completedSteps={completedSteps}
          onStepClick={setBookingStep}
        />
      </div>

      {/* ── Desktop Header ──────────────────────────── */}
      <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          {/* Centered Timer + Progress */}
          <div className="flex items-center justify-center gap-6">
            {timerStartedAt && (
              <SessionTimer
                startedAt={timerStartedAt}
                onExpire={() => setIsSessionExpired(true)}
                variant="inline"
              />
            )}
            <BookingProgress
              currentStep={bookingStep}
              completedSteps={completedSteps}
              onStepClick={setBookingStep}
            />
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-6">
          {/* ── Left Sidebar (Desktop) ──────────────── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-900">
                  {BOOKING_STEPS[bookingStep - 1]?.label}
                </h3>
              </div>
              <nav className="py-2">
                {BOOKING_STEPS.map((step) => {
                  const isActive = bookingStep === step.id;
                  const isCompleted = completedSteps.includes(step.id);
                  const isNavigable =
                    step.id <= Math.max(...completedSteps, 0) + 1;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={!isNavigable}
                      onClick={() => setBookingStep(step.id)}
                      className={cn(
                        "w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold transition-all border-l-3 outline-none bg-transparent",
                        isActive
                          ? "border-primary-500 bg-primary-50/50 text-primary-700 cursor-default"
                          : isCompleted
                            ? "border-emerald-400 text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50/60 cursor-pointer"
                            : isNavigable
                              ? "border-transparent text-gray-500 hover:bg-gray-50/50 cursor-pointer"
                              : "border-transparent text-gray-400 cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                          isActive
                            ? "bg-primary-500 text-white"
                            : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 text-gray-400",
                        )}
                      >
                        {isCompleted ? "✓" : step.id}
                      </span>
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ── Main Content Area ──────────────────── */}
          <main className="flex-1 min-w-0 pb-24 lg:pb-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 lg:p-6">
              {/* Step 1: Passenger Details */}
              {bookingStep === 1 && (
                <PassengerForm
                  passengerCount={passengerCount}
                  initialData={
                    formData.passengers.length > 0
                      ? formData.passengers
                      : undefined
                  }
                  onSubmit={handlePassengerSubmit}
                />
              )}

              {/* Step 2: Add-On Services */}
              {bookingStep === 2 && (
                <AddOnServicesForm
                  passengerLabels={passengerLabels}
                  initialData={
                    formData.addOns.length > 0 ? formData.addOns : undefined
                  }
                  onSubmit={handleAddOnSubmit}
                />
              )}

              {/* Step 3: Extra Baggage */}
              {bookingStep === 3 && (
                <ExtraBaggageForm
                  passengerLabels={passengerLabels}
                  initialData={
                    formData.baggage.length > 0 ? formData.baggage : undefined
                  }
                  cabin={selectedFlight.cabin}
                  onSubmit={handleBaggageSubmit}
                />
              )}

              {/* Step 4: Seat Selection */}
              {bookingStep === 4 && (
                <SeatSelectionForm
                  passengerLabels={passengerLabels}
                  initialData={
                    formData.seats.length > 0 ? formData.seats : undefined
                  }
                  onSubmit={handleSeatSubmit}
                />
              )}

              {/* Step 5: Review & Payment */}
              {bookingStep === 5 && (
                <ReviewPaymentForm
                  flight={selectedFlight}
                  passengerCount={passengerCount}
                  passengers={formData.passengers}
                  addOns={formData.addOns}
                  baggage={formData.baggage}
                  seats={formData.seats}
                  initialPayment={
                    formData.payment.cardNumber ? formData.payment : undefined
                  }
                  onSubmit={handlePaymentSubmit}
                  isSubmitting={isSubmitting}
                  agreedToTerms={agreedToTerms}
                  onAgreeChange={setAgreedToTerms}
                />
              )}

              {/* Desktop Navigation Buttons */}
              <div className="hidden lg:flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={bookingStep === 1 ? () => router.back() : prevStep}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer px-4 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                  <span>
                    {bookingStep === 1
                      ? "Back to Results"
                      : `Back to ${BOOKING_STEPS[bookingStep - 2]?.label ?? ""}`}
                  </span>
                </button>

                {bookingStep < TOTAL_BOOKING_STEPS && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-6 py-2.5 rounded-full text-sm shadow-md transition-all cursor-pointer"
                  >
                    <span>Save & Continue</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* ── Right Sidebar (Desktop) ─────────────── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <FlightSummaryCard
                flight={selectedFlight}
                passengerCount={passengerCount}
                extraCharges={extraCharges}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile Bottom Bar ───────────────────────── */}
      <MobileBottomBar
        flight={selectedFlight}
        passengerCount={passengerCount}
        extraCharges={extraCharges}
        currentStep={bookingStep}
        totalSteps={TOTAL_BOOKING_STEPS}
        onBack={bookingStep === 1 ? () => router.back() : prevStep}
        onNext={handleNext}
        isSubmitting={isSubmitting}
        isNextDisabled={bookingStep === 5 && !agreedToTerms}
        nextLabel={
          bookingStep === TOTAL_BOOKING_STEPS ? "Confirm & Pay" : "Next"
        }
      />

      {/* Forced Session Expiration Modal Overlay */}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onAction={() => {
          resetBooking();
          window.location.href = "/";
        }}
      />
    </div>
  );
}
