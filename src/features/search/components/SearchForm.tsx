"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/Button";
import { AirportInput } from "./AirportInput";
import { DatePicker } from "./DatePicker";
import { PassengerSelector } from "./PassengerSelector";
import { CustomCalendar } from "./CustomCalendar";
import { MobileDateBottomSheet } from "./MobileDateBottomSheet";
import { MobilePassengerBottomSheet } from "./MobilePassengerBottomSheet";
import type { PassengerCount, CabinClass } from "@/shared/types";

const cabinOptions: { value: CabinClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium-economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

type SearchFormProps = {
  className?: string;
};

export function SearchForm({ className }: SearchFormProps) {
  const router = useRouter();

  // Pre-fill defaults matching screenshot: DAC to CXB, tomorrow to day-after-tomorrow
  const getOffsetDateString = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split("T")[0] ?? "";
  };

  const todayStr = useMemo(
    () => new Date().toISOString().split("T")[0] ?? "",
    [],
  );

  const [tripType, setTripType] = useState<
    "one-way" | "round-trip" | "multi-city"
  >("round-trip");
  const [origin, setOrigin] = useState("DAC");
  const [destination, setDestination] = useState("CXB");
  const [departureDate, setDepartureDate] = useState(() =>
    getOffsetDateString(1),
  );
  const [returnDate, setReturnDate] = useState(() => getOffsetDateString(3));
  const [passengers, setPassengers] = useState<PassengerCount>({
    adults: 1,
    children: 0,
    kids: 0,
    infants: 0,
  });
  const [cabin, setCabin] = useState<CabinClass>("economy");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isCabinOpen, setIsCabinOpen] = useState(false);

  // Independent calendar popover states
  const [isDepCalendarOpen, setIsDepCalendarOpen] = useState(false);
  const [isRetCalendarOpen, setIsRetCalendarOpen] = useState(false);

  // Mobile Bottom Sheet states
  const [isMobileDepOpen, setIsMobileDepOpen] = useState(false);
  const [isMobileRetOpen, setIsMobileRetOpen] = useState(false);
  const [isMobilePaxOpen, setIsMobilePaxOpen] = useState(false);

  const cabinRef = useRef<HTMLDivElement>(null);
  const depCalendarRef = useRef<HTMLDivElement>(null);
  const retCalendarRef = useRef<HTMLDivElement>(null);

  // Close Cabin dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        cabinRef.current &&
        !cabinRef.current.contains(event.target as Node)
      ) {
        setIsCabinOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close Calendars on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        depCalendarRef.current &&
        !depCalendarRef.current.contains(event.target as Node)
      ) {
        setIsDepCalendarOpen(false);
      }
      if (
        retCalendarRef.current &&
        !retCalendarRef.current.contains(event.target as Node)
      ) {
        setIsRetCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  function handleSubmit(e: React.SubmitEvent) {
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
  }

  const MobileDateDetailsHeader = isMobileDepOpen ? "Departure" : "Return";

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
        {/* Left: Trip Type toggles */}
        <div className="flex items-center gap-2">
          {/* One Way */}
          <button
            key="one-way"
            type="button"
            onClick={() => handleTripTypeChange("one-way")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors cursor-pointer",
              tripType === "one-way"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200",
            )}
          >
            <span
              className={cn(
                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0",
                tripType === "one-way" ? "border-white" : "border-gray-400",
              )}
            >
              {tripType === "one-way" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            One Way
          </button>

          {/* Round Trip */}
          <button
            key="round-trip"
            type="button"
            onClick={() => handleTripTypeChange("round-trip")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors cursor-pointer",
              tripType === "round-trip"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200",
            )}
          >
            <span
              className={cn(
                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0",
                tripType === "round-trip" ? "border-white" : "border-gray-400",
              )}
            >
              {tripType === "round-trip" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            Round Trip
          </button>

          {/* Multi City - Disabled */}
          <button
            key="multi-city"
            type="button"
            disabled
            className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed opacity-60"
            title="Multi City is not supported yet"
          >
            <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2 shrink-0" />
            Multi City
          </button>
        </div>

        {/* Right: Popover Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Passengers Selector */}
          <PassengerSelector
            value={passengers}
            onChange={setPassengers}
            variant="pill"
          />

          {/* Cabin Class Popover */}
          <div ref={cabinRef} className="relative">
            <button
              type="button"
              onClick={() => setIsCabinOpen(!isCabinOpen)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100/80 transition-colors flex items-center gap-1.5 border-none shadow-none cursor-pointer"
            >
              <span>
                {cabinOptions.find((o) => o.value === cabin)?.label ||
                  "Economy"}
              </span>
              <svg
                className={cn(
                  "h-3.5 w-3.5 text-blue-500 transition-transform",
                  isCabinOpen && "rotate-180",
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isCabinOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-[calc(100vw-32px)] sm:w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-50 animate-fade-in">
                {cabinOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setCabin(option.value);
                      setIsCabinOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors cursor-pointer flex items-center",
                      cabin === option.value
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {/* Radio Button Selector Icon */}
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2.5 shrink-0 transition-colors",
                        cabin === option.value
                          ? "border-blue-500"
                          : "border-gray-300",
                      )}
                    >
                      {cabin === option.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Mobile Header Row: Simple Radio Buttons */}
      <div className="flex md:hidden items-center gap-5 mb-5 px-1">
        {/* One Way */}
        <button
          type="button"
          onClick={() => handleTripTypeChange("one-way")}
          className="flex items-center text-xs cursor-pointer select-none"
        >
          <span
            className={cn(
              "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0 transition-colors",
              tripType === "one-way"
                ? "border-blue-500 text-blue-600"
                : "border-gray-300",
            )}
          >
            {tripType === "one-way" && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              tripType === "one-way" ? "text-gray-900" : "text-gray-500",
            )}
          >
            One Way
          </span>
        </button>

        {/* Round Trip */}
        <button
          type="button"
          onClick={() => handleTripTypeChange("round-trip")}
          className="flex items-center text-xs cursor-pointer select-none"
        >
          <span
            className={cn(
              "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0 transition-colors",
              tripType === "round-trip"
                ? "border-blue-500 text-blue-600"
                : "border-gray-300",
            )}
          >
            {tripType === "round-trip" && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            )}
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              tripType === "round-trip" ? "text-gray-900" : "text-gray-500",
            )}
          >
            Round Trip
          </span>
        </button>

        {/* Multi City - Disabled */}
        <button
          type="button"
          disabled
          className="flex items-center text-xs cursor-not-allowed opacity-50 select-none"
        >
          <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2 shrink-0" />
          <span className="text-xs font-semibold text-gray-500">
            Multi City
          </span>
        </button>
      </div>

      {/* Main Form Fields Container (Desktop: Flex/Grid, Mobile: Stacking) */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
        {/* Origin & Destination wrapper (handles absolute swap button in the center) */}
        <div className="relative flex flex-col sm:flex-row gap-3 lg:gap-0 flex-1 lg:w-[48%]">
          <AirportInput
            placeholderLabel="Departure"
            value={origin}
            onChange={(code) => {
              setOrigin(code);
              if (errors.origin) setErrors((prev) => ({ ...prev, origin: "" }));
            }}
            placeholder="Departure city"
            error={errors.origin}
            className="w-full lg:w-1/2 lg:rounded-r-none"
          />

          {/* Absolute Swap Button (Right-aligned overlap on mobile, centered on desktop) */}
          <button
            type="button"
            onClick={swapAirports}
            className="absolute right-6 top-19.5 -translate-y-1/2 z-30 lg:left-1/2 lg:top-1/2 lg:right-auto lg:-translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-transparent shadow-none lg:bg-white lg:shadow-md hover:bg-gray-50/50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
            aria-label="Swap origin and destination"
          >
            <svg
              className="h-4.5 w-4.5 rotate-90 lg:rotate-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          </button>

          <AirportInput
            placeholderLabel="Arrival"
            value={destination}
            onChange={(code) => {
              setDestination(code);
              if (errors.destination)
                setErrors((prev) => ({ ...prev, destination: "" }));
            }}
            placeholder="Arrival city"
            error={errors.destination}
            className="w-full lg:w-1/2 lg:rounded-l-none lg:border-l-0"
          />
        </div>

        {/* Departure Date & Return Date wrapper with separate popover calendars */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:w-[42%]">
          {/* Departure Date Container */}
          <div ref={depCalendarRef} className="relative flex-1">
            <DatePicker
              placeholderLabel="Departure"
              value={departureDate}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsMobileDepOpen(true);
                } else {
                  setIsDepCalendarOpen(true);
                  setIsRetCalendarOpen(false);
                }
              }}
              error={errors.departureDate}
              className="w-full"
            />
            {isDepCalendarOpen && (
              <div
                className={cn(
                  "absolute top-20 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in left-0",
                  tripType === "one-way"
                    ? "w-full sm:w-[320px]"
                    : "w-full sm:w-155 md:w-160",
                )}
              >
                <CustomCalendar
                  value={departureDate}
                  departureDate={departureDate}
                  returnDate={returnDate}
                  minDate={todayStr}
                  tripType={tripType === "one-way" ? "one-way" : "round-trip"}
                  onChange={(date) => {
                    setDepartureDate(date);
                    if (errors.departureDate)
                      setErrors((prev) => ({ ...prev, departureDate: "" }));
                    if (
                      tripType === "round-trip" &&
                      returnDate &&
                      date > returnDate
                    ) {
                      setReturnDate(""); // Clear invalid range
                    }
                  }}
                  onClose={() => setIsDepCalendarOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Return Date Container */}
          <div ref={retCalendarRef} className="relative flex-1">
            <div
              onClick={() => {
                if (tripType === "one-way") {
                  handleTripTypeChange("round-trip");
                }
              }}
              className="w-full"
            >
              <DatePicker
                placeholderLabel="Return"
                value={returnDate}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsMobileRetOpen(true);
                  } else {
                    setIsRetCalendarOpen(true);
                    setIsDepCalendarOpen(false);
                  }
                }}
                error={errors.returnDate}
                disabled={tripType === "one-way"}
                className="w-full"
              />
            </div>
            {isRetCalendarOpen && (
              <div
                className={cn(
                  "absolute top-20 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in right-0",
                  tripType === "one-way"
                    ? "w-full sm:w-[320px]"
                    : "w-full sm:w-155 md:w-160",
                )}
              >
                <CustomCalendar
                  value={returnDate}
                  departureDate={departureDate}
                  returnDate={returnDate}
                  minDate={departureDate || todayStr}
                  tripType={tripType === "one-way" ? "one-way" : "round-trip"}
                  onChange={(date) => {
                    setReturnDate(date);
                    if (errors.returnDate)
                      setErrors((prev) => ({ ...prev, returnDate: "" }));
                  }}
                  onClose={() => setIsRetCalendarOpen(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Combined Passenger and Cabin class (Mobile only, triggers bottom sheet) */}
        <div
          onClick={() => setIsMobilePaxOpen(true)}
          className="flex md:hidden items-center w-full h-18 rounded-xl bg-[#f4f5f8] relative cursor-pointer"
        >
          {/* Passenger Selector (mobile left-card display, click disabled here to let card click handle it) */}
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
            className="w-full lg:w-auto h-12 lg:h-18 lg:aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-200/50 hover:shadow-lg transition-all cursor-pointer"
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
          onChange={setDepartureDate}
          minDate={todayStr}
          tripType={tripType}
          title={MobileDateDetailsHeader}
        />
      )}

      {isMobileRetOpen && (
        <MobileDateBottomSheet
          isOpen={isMobileRetOpen}
          onClose={() => setIsMobileRetOpen(false)}
          value={returnDate}
          onChange={setReturnDate}
          minDate={departureDate || todayStr}
          tripType={tripType}
          title={MobileDateDetailsHeader}
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
