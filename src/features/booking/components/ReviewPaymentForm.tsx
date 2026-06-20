"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { cn } from "@/shared/utils/cn";
import { formatPrice } from "@/shared/utils/formatPrice";
import { formatDuration } from "@/shared/utils/formatDuration";
import { PaymentFormSchema } from "@/features/booking/schemas/bookingSchemas";
import type { Flight, PassengerCount } from "@/shared/types";
import type {
  PassengerFormData,
  AddOnData,
  BaggageData,
  SeatData,
  PaymentData,
} from "@/store/bookingStore";
import mealsData from "@/data/meals.json";
import insuranceData from "@/data/insurance.json";
import baggageData from "@/data/baggageOptions.json";
import { formatBookingDate, formatTicketTime } from "@/shared/utils/formatDate";

// ─── Types ─────────────────────────────────────────────────

type ReviewPaymentFormProps = {
  flight: Flight;
  passengerCount: PassengerCount;
  passengers: PassengerFormData[];
  addOns: AddOnData[];
  baggage: BaggageData[];
  seats: SeatData[];
  initialPayment?: PaymentData;
  onSubmit: (payment: PaymentData) => void;
  isSubmitting: boolean;
  agreedToTerms: boolean;
  onAgreeChange: (agreed: boolean) => void;
};

const formatReviewDate = formatBookingDate;

// ─── Component ─────────────────────────────────────────────

export function ReviewPaymentForm({
  flight,
  passengerCount,
  passengers,
  addOns,
  baggage,
  seats,
  initialPayment,
  onSubmit,
  isSubmitting,
  agreedToTerms,
  onAgreeChange,
}: ReviewPaymentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentData>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: initialPayment ?? {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
    mode: "onBlur",
  });

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  if (!firstSegment || !lastSegment) return null;

  const airline = firstSegment.airline;

  // Auto-fill demo card
  const fillDemoCard = () => {
    setValue("cardholderName", "DEMO PASSENGER", { shouldValidate: true });
    setValue(
      "cardNumber",
      process.env.NEXT_PUBLIC_DEMO_CARD_NUMBER || "4242424242424242",
      { shouldValidate: true },
    );
    setValue(
      "expiryDate",
      process.env.NEXT_PUBLIC_DEMO_CARD_EXPIRY || "12/28",
      { shouldValidate: true },
    );
    setValue("cvv", process.env.NEXT_PUBLIC_DEMO_CARD_CVV || "123", {
      shouldValidate: true,
    });
  };

  // Calculate extras total
  const insuranceTotal = addOns.reduce((sum, ao) => {
    const ins = insuranceData.find((i) => i.id === ao.insuranceId);
    return sum + (ins?.price.amount ?? 0);
  }, 0);

  const baggageTotal = baggage.reduce((sum, b) => {
    const bag = baggageData.find((bo) => bo.id === b.extraBaggageId);
    return sum + (bag?.price.amount ?? 0);
  }, 0);

  const extraCharges = insuranceTotal + baggageTotal;

  // Calculate total
  const adultTotal = passengerCount.adults * flight.price.amount;
  const childTotal =
    passengerCount.children * Math.round(flight.price.amount * 0.75);
  const kidsTotal =
    passengerCount.kids * Math.round(flight.price.amount * 0.75);
  const infantTotal =
    passengerCount.infants * Math.round(flight.price.amount * 0.1);
  const subtotal = adultTotal + childTotal + kidsTotal + infantTotal;
  const discount = Math.round(flight.price.amount * 0.06);
  const convenienceFee = 108;
  const totalPrice = subtotal - discount + convenienceFee + extraCharges;

  const handleFormSubmit = (data: PaymentData) => {
    if (!agreedToTerms) return;
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="w-full"
      id="payment-form"
    >
      <h2 className="text-lg font-extrabold text-gray-900 mb-5">
        Review & Payment
      </h2>

      {/* ── Flight Summary ──────────────────────────── */}
      <div className="border border-gray-200 rounded-xl p-4 mb-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          ✈️ Flight Details
        </h3>
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-md overflow-hidden border border-gray-100 bg-white p-0.5 shrink-0">
            <Image
              src={airline.logo}
              alt={airline.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">
              {firstSegment.departure.airport.code} →{" "}
              {lastSegment.arrival.airport.code}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              {airline.name} • {firstSegment.flightNumber} •{" "}
              {formatDuration(flight.totalDurationMinutes)}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">
              {formatReviewDate(firstSegment.departure.time)} •{" "}
              {formatTicketTime(firstSegment.departure.time)} -{" "}
              {formatTicketTime(lastSegment.arrival.time)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Passengers Summary ──────────────────────── */}
      <div className="border border-gray-200 rounded-xl p-4 mb-5">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          👥 Passengers ({passengers.length})
        </h3>
        <div className="space-y-2">
          {passengers.map((pax, i) => {
            const meal = mealsData.find((m) => m.id === addOns[i]?.mealType);
            const seatNum = seats[i]?.seatNumber;

            return (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-xs font-bold text-gray-800">
                    {pax.givenName} {pax.surname}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {pax.gender} • {pax.nationality}
                    {meal && meal.id !== "none" ? ` • ${meal.name}` : ""}
                    {seatNum ? ` • Seat ${seatNum}` : ""}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {i < passengerCount.adults
                    ? "Adult"
                    : i < passengerCount.adults + passengerCount.children
                      ? "Child"
                      : "Infant"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Price Breakdown ─────────────────────────── */}
      <div className="border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          💰 Price Breakdown
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>Flight fare ({passengers.length} pax)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {extraCharges > 0 && (
            <div className="flex justify-between text-xs font-medium text-gray-600">
              <span>Add-ons & Extras</span>
              <span>+ {formatPrice(extraCharges)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-medium text-emerald-600">
            <span>Discount</span>
            <span>- {formatPrice(discount)}</span>
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>Convenience Fee</span>
            <span>+ {formatPrice(convenienceFee)}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* ── Payment Form ────────────────────────────── */}
      <div className="border border-gray-200 rounded-xl p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            💳 Payment Details
          </h3>
          <button
            type="button"
            onClick={fillDemoCard}
            className="text-[11px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            Use Demo Card
          </button>
        </div>

        <div className="space-y-4">
          {/* Cardholder Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Cardholder Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register("cardholderName")}
              placeholder="Name on card"
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                errors.cardholderName
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            {errors.cardholderName && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {errors.cardholderName.message}
              </p>
            )}
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Card Number <span className="text-red-400">*</span>
            </label>
            <input
              {...register("cardNumber")}
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              className={cn(
                "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all font-mono tracking-widest",
                errors.cardNumber
                  ? "border-red-400 bg-red-50/50"
                  : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
              )}
            />
            {errors.cardNumber && (
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                {errors.cardNumber.message}
              </p>
            )}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Expiry <span className="text-red-400">*</span>
              </label>
              <input
                {...register("expiryDate")}
                placeholder="MM/YY"
                maxLength={5}
                className={cn(
                  "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                  errors.expiryDate
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
                )}
              />
              {errors.expiryDate && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">
                  {errors.expiryDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                CVV <span className="text-red-400">*</span>
              </label>
              <input
                {...register("cvv")}
                type="password"
                placeholder="•••"
                maxLength={4}
                className={cn(
                  "w-full border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none transition-all",
                  errors.cvv
                    ? "border-red-400 bg-red-50/50"
                    : "border-gray-200 bg-white focus:border-primary-400 focus:ring-1 focus:ring-primary-100",
                )}
              />
              {errors.cvv && (
                <p className="text-[11px] text-red-500 font-semibold mt-1">
                  {errors.cvv.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <label className="flex items-start gap-3 mb-5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => onAgreeChange(e.target.checked)}
          className="h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-0.5 cursor-pointer"
        />
        <span className="text-xs text-gray-600 font-medium leading-relaxed">
          I agree to the{" "}
          <span className="text-primary-600 font-bold">Terms & Conditions</span>
          , <span className="text-primary-600 font-bold">Privacy Policy</span>,
          and the <span className="text-primary-600 font-bold">Fare Rules</span>{" "}
          for this booking.
        </span>
      </label>

      {/* Submit — Desktop only (mobile uses bottom bar) */}
      <div className="hidden lg:block">
        <button
          type="submit"
          disabled={!agreedToTerms || isSubmitting}
          className={cn(
            "w-full font-extrabold py-3.5 rounded-xl text-sm shadow-lg transition-all cursor-pointer",
            !agreedToTerms || isSubmitting
              ? "bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 text-white",
          )}
        >
          {isSubmitting
            ? "Processing Payment..."
            : `Confirm & Pay ${formatPrice(totalPrice)}`}
        </button>
      </div>
    </form>
  );
}
