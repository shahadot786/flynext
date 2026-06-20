"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/Button";
import { PassengerSelector } from "./PassengerSelector";
import { MobileDateBottomSheet } from "./MobileDateBottomSheet";
import { MobilePassengerBottomSheet } from "./MobilePassengerBottomSheet";

// Sub-components
import { TripTypeSelector } from "./TripTypeSelector";
import { CabinClassPopover } from "./CabinClassPopover";
import { AirportInputSection } from "./AirportInputSection";
import { DatePickerSection } from "./DatePickerSection";

import type { PassengerCount, CabinClass } from "@/shared/types";

const cabinOptions: { value: CabinClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium-economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

type SearchFormProps = {
  className?: string;
  onSubmitSuccess?: () => void;
};

function SearchFormClient({ className, onSubmitSuccess }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill defaults: DAC to CXB, tomorrow to day-after-tomorrow
  const getOffsetDateString = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0] ?? "";
  };

  const todayStr = useMemo(
    () => new Date().toISOString().split("T")[0] ?? "",
    [],
  );

  const originParam = searchParams.get("origin");
  const destParam = searchParams.get("destination");
  const dateParam = searchParams.get("date");
  const returnDateParam = searchParams.get("returnDate");
  const adultsParam = searchParams.get("adults");
  const childrenParam = searchParams.get("children");
  const kidsParam = searchParams.get("kids");
  const infantsParam = searchParams.get("infants");
  const cabinParam = searchParams.get("cabin");

  const [origin, setOrigin] = useState(() => originParam || "DAC");
  const [destination, setDestination] = useState(() => destParam || "CXB");
  const [departureDate, setDepartureDate] = useState(
    () => dateParam || getOffsetDateString(1),
  );
  const [returnDate, setReturnDate] = useState(
    () => returnDateParam || (dateParam ? "" : getOffsetDateString(3)),
  );
  const [tripType, setTripType] = useState<
    "one-way" | "round-trip" | "multi-city"
  >(() =>
    returnDateParam ? "round-trip" : dateParam ? "one-way" : "round-trip",
  );
  const [passengers, setPassengers] = useState<PassengerCount>(() => ({
    adults: Number(adultsParam) || 1,
    children: Number(childrenParam) || 0,
    kids: Number(kidsParam) || 0,
    infants: Number(infantsParam) || 0,
  }));
  const [cabin, setCabin] = useState<CabinClass>(
    () => (cabinParam as CabinClass) || "economy",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);

  // Mobile Bottom Sheet states
  const [isMobileDepOpen, setIsMobileDepOpen] = useState(false);
  const [isMobileRetOpen, setIsMobileRetOpen] = useState(false);
  const [isMobilePaxOpen, setIsMobilePaxOpen] = useState(false);

  function swapAirports() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }

  function handleTripTypeChange(type: "one-way" | "round-trip") {
    setTripType(type);
    if (type === "one-way") {
      setReturnDate("");
    } else if (type === "round-trip" && !returnDate) {
      if (departureDate) {
        const d = new Date(departureDate);
        d.setDate(d.getDate() + 2);
        setReturnDate(d.toISOString().split("T")[0] ?? "");
      }
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!origin) newErrors.origin = "Required";
    if (!destination) newErrors.destination = "Required";
    if (!departureDate) newErrors.departureDate = "Required";
    if (tripType === "round-trip" && !returnDate) {
      newErrors.returnDate = "Required";
    }
    if (origin && destination && origin === destination) {
      newErrors.destination = "Must differ";
    }
    if (departureDate && returnDate && tripType === "round-trip") {
      if (new Date(departureDate) > new Date(returnDate)) {
        newErrors.returnDate = "Must be after departure";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSearching(true);

    const params = new URLSearchParams();
    params.set("origin", origin);
    params.set("destination", destination);
    params.set("date", departureDate);
    params.set("adults", passengers.adults.toString());
    params.set("children", passengers.children.toString());
    params.set("kids", (passengers.kids ?? 0).toString());
    params.set("infants", passengers.infants.toString());
    params.set("cabin", cabin);
    if (tripType === "round-trip" && returnDate) {
      params.set("returnDate", returnDate);
    }

    router.push(`/search?${params.toString()}`);
    onSubmitSuccess?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200/90 p-6 sm:p-8",
        className,
      )}
    >
      {/* 1. Desktop Header Row: Trip Type on left, Passengers & Cabin Class on right */}
      <div className="hidden md:flex items-center justify-between gap-4 mb-6">
        {/* Left: Trip Type Selector */}
        <TripTypeSelector
          value={tripType}
          onChange={handleTripTypeChange}
          variant="desktop"
        />

        {/* Right: Popover Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Passengers Selector */}
          <PassengerSelector
            value={passengers}
            onChange={setPassengers}
            variant="pill"
          />

          {/* Cabin Class Popover */}
          <CabinClassPopover value={cabin} onChange={setCabin} />
        </div>
      </div>

      {/* 2. Mobile Header Row: Simple Radio Buttons */}
      <TripTypeSelector
        value={tripType}
        onChange={handleTripTypeChange}
        variant="mobile"
      />

      {/* Main Form Fields Container (Desktop: Flex/Grid, Mobile: Stacking) */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
        {/* Origin & Destination inputs with overlapping Swap Button */}
        <AirportInputSection
          origin={origin}
          destination={destination}
          onChangeOrigin={(code) => {
            setOrigin(code);
            if (errors.origin) setErrors((prev) => ({ ...prev, origin: "" }));
          }}
          onChangeDestination={(code) => {
            setDestination(code);
            if (errors.destination)
              setErrors((prev) => ({ ...prev, destination: "" }));
          }}
          onSwap={swapAirports}
          errors={errors}
        />

        {/* Date Pickers and Popover Calendars */}
        <DatePickerSection
          departureDate={departureDate}
          returnDate={returnDate}
          onChangeDepartureDate={(date) => {
            setDepartureDate(date);
            if (errors.departureDate)
              setErrors((prev) => ({ ...prev, departureDate: "" }));
          }}
          onChangeReturnDate={(date) => {
            setReturnDate(date);
            if (errors.returnDate)
              setErrors((prev) => ({ ...prev, returnDate: "" }));
          }}
          tripType={tripType}
          onChangeTripType={handleTripTypeChange}
          todayStr={todayStr}
          errors={errors}
          onOpenMobileDep={() => setIsMobileDepOpen(true)}
          onOpenMobileRet={() => setIsMobileRetOpen(true)}
        />

        {/* Card 4: Combined Passenger and Cabin class (Mobile only, triggers bottom sheet) */}
        <div
          onClick={() => setIsMobilePaxOpen(true)}
          className="flex md:hidden items-center w-full h-18 rounded-xl bg-white border border-gray-200 relative cursor-pointer"
        >
          {/* Passenger Selector */}
          <div className="flex-1 h-full pointer-events-none">
            <PassengerSelector
              value={passengers}
              onChange={() => {}}
              variant="mobile-left-card"
              className="w-full h-full"
            />
          </div>

          {/* Vertical divider */}
          <div className="h-8 w-px bg-gray-300 shrink-0" />

          {/* Cabin Selector display on the right */}
          <div className="relative shrink-0 pr-6 pl-4 h-full flex items-center justify-center pointer-events-none">
            <span className="text-sm font-semibold text-[#5e6675] select-none">
              {cabinOptions.find((o) => o.value === cabin)?.label || "Economy"}
            </span>
          </div>
        </div>

        {/* Search Button */}
        <div className="lg:w-[10%] w-full flex justify-end shrink-0">
          <Button
            type="submit"
            isLoading={isSearching}
            className="w-full lg:w-auto h-10 lg:h-14 lg:aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200/50 hover:shadow-lg transition-all cursor-pointer"
          >
            {!isSearching && (
              <svg
                className="h-5 w-5 lg:h-6 lg:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            )}
            <span className="lg:hidden ml-2 font-semibold text-sm">
              Search Flight
            </span>
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Bottom Sheets */}
      {isMobileDepOpen && (
        <MobileDateBottomSheet
          isOpen={isMobileDepOpen}
          onClose={() => setIsMobileDepOpen(false)}
          value={departureDate}
          onChange={(date) => {
            setDepartureDate(date);
            if (errors.departureDate)
              setErrors((prev) => ({ ...prev, departureDate: "" }));
          }}
          minDate={todayStr}
          tripType={tripType}
          title="Departure"
        />
      )}

      {isMobileRetOpen && (
        <MobileDateBottomSheet
          isOpen={isMobileRetOpen}
          onClose={() => setIsMobileRetOpen(false)}
          value={returnDate}
          onChange={(date) => {
            setReturnDate(date);
            if (errors.returnDate)
              setErrors((prev) => ({ ...prev, returnDate: "" }));
          }}
          minDate={departureDate || todayStr}
          tripType={tripType}
          title="Return"
        />
      )}

      {isMobilePaxOpen && (
        <MobilePassengerBottomSheet
          isOpen={isMobilePaxOpen}
          onClose={() => setIsMobilePaxOpen(false)}
          passengers={passengers}
          onChangePassengers={setPassengers}
          cabin={cabin}
          onChangeCabin={setCabin}
        />
      )}
    </form>
  );
}

export function SearchForm(props: SearchFormProps) {
  return (
    <Suspense
      fallback={
        <div className="h-70 w-full rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200/90 animate-pulse flex items-center justify-center text-gray-400 font-medium">
          Loading search form...
        </div>
      }
    >
      <SearchFormClient {...props} />
    </Suspense>
  );
}
