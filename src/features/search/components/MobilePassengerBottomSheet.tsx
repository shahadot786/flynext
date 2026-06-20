"use client";

import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import type { PassengerCount, CabinClass } from "@/shared/types";

type MobilePassengerBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  passengers: PassengerCount;
  onChangePassengers: (passengers: PassengerCount) => void;
  cabin: CabinClass;
  onChangeCabin: (cabin: CabinClass) => void;
};

type PassengerType = keyof PassengerCount;

const cabinOptions: { value: CabinClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium-economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

export function MobilePassengerBottomSheet({
  isOpen,
  onClose,
  passengers,
  onChangePassengers,
  cabin,
  onChangeCabin,
}: MobilePassengerBottomSheetProps) {
  // Local state for passengers and cabin to commit on "Done"
  const [localPassengers, setLocalPassengers] =
    useState<PassengerCount>(passengers);
  const [localCabin, setLocalCabin] = useState<CabinClass>(cabin);

  const totalPassengers =
    localPassengers.adults +
    localPassengers.children +
    (localPassengers.kids ?? 0) +
    localPassengers.infants;

  const passengerTypes: {
    key: PassengerType;
    label: string;
    sublabel: string;
    min: number;
    max: number;
    icon: React.ReactNode;
  }[] = [
    {
      key: "adults",
      label: "Adults",
      sublabel: "12 years & above",
      min: 1,
      max: 9,
      icon: (
        <svg
          className="h-5 w-5 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      ),
    },
    {
      key: "children",
      label: "Children",
      sublabel: "From 5 to under 12",
      min: 0,
      max: 9,
      icon: (
        <svg
          className="h-4.5 w-4.5 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="7" r="3" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 21v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"
          />
        </svg>
      ),
    },
    {
      key: "kids",
      label: "Kids",
      sublabel: "From 2 to under 5",
      min: 0,
      max: 9,
      icon: (
        <svg
          className="h-4 w-4 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="8" r="2.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 20v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"
          />
        </svg>
      ),
    },
    {
      key: "infants",
      label: "Infants",
      sublabel: "Under 2 years",
      min: 0,
      max: 9,
      icon: (
        <svg
          className="h-4.5 w-4.5 text-gray-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="6" r="2.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 13c0-1.5 1.5-2 3-2s3 .5 3 2v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4z"
          />
          <circle cx="9" cy="18" r="0.75" fill="currentColor" />
          <circle cx="15" cy="18" r="0.75" fill="currentColor" />
        </svg>
      ),
    },
  ];

  function handleChange(type: PassengerType, delta: number) {
    const config = passengerTypes.find((p) => p.key === type);
    if (!config) return;

    const currentValue = localPassengers[type] ?? 0;
    const newValue = currentValue + delta;
    if (newValue < config.min || newValue > config.max) return;

    // Infants cannot exceed adults
    if (type === "infants" && newValue > localPassengers.adults) return;

    // Adjust infants if adults decrease
    let newInfants = localPassengers.infants;
    if (type === "adults" && localPassengers.infants > newValue) {
      newInfants = newValue;
    }

    setLocalPassengers({
      ...localPassengers,
      adults: type === "adults" ? newValue : localPassengers.adults,
      children: type === "children" ? newValue : localPassengers.children,
      kids: type === "kids" ? newValue : (localPassengers.kids ?? 0),
      infants: type === "infants" ? newValue : newInfants,
    });
  }

  const handleDone = () => {
    onChangePassengers(localPassengers);
    onChangeCabin(localCabin);
    onClose();
  };

  const handleReset = () => {
    setLocalPassengers({
      adults: 1,
      children: 0,
      kids: 0,
      infants: 0,
    });
    setLocalCabin("economy");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-100 flex flex-col select-none animate-fade-in md:hidden">
      {/* 1. Header */}
      <div className="bg-blue-600 text-white h-14 flex items-center px-4 justify-between shrink-0 relative shadow-sm">
        {/* Back Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none cursor-pointer"
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
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* Header Title */}
        <div className="text-center flex-1">
          <h2 className="text-base font-bold tracking-wide">
            Passengers & Class
          </h2>
          <p className="text-[10px] text-blue-100 font-medium tracking-wider uppercase mt-0.5">
            {totalPassengers} {totalPassengers > 1 ? "Passengers" : "Passenger"}{" "}
            • {cabinOptions.find((o) => o.value === localCabin)?.label}
          </p>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none cursor-pointer"
          aria-label="Close"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 2. Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        {/* Section A: Passenger Count Adjustment */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
            Select Passengers
          </h3>
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-1">
            {passengerTypes.map(({ key, label, sublabel, min, max, icon }) => (
              <div
                key={key}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
                  </div>
                </div>

                {/* Adjuster +/- buttons */}
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleChange(key, -1)}
                    disabled={(localPassengers[key] ?? 0) <= min}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 text-blue-500 text-lg font-semibold transition-colors bg-white cursor-pointer",
                      "active:bg-blue-50 focus:outline-none",
                      (localPassengers[key] ?? 0) <= min &&
                        "opacity-30 cursor-not-allowed border-gray-200 text-gray-300 active:bg-white",
                    )}
                    aria-label={`Decrease ${label}`}
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-gray-900">
                    {localPassengers[key] ?? 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChange(key, 1)}
                    disabled={
                      (localPassengers[key] ?? 0) >= max || totalPassengers >= 9
                    }
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border border-blue-500 text-blue-500 text-lg font-semibold transition-colors bg-white cursor-pointer",
                      "active:bg-blue-50 focus:outline-none",
                      ((localPassengers[key] ?? 0) >= max ||
                        totalPassengers >= 9) &&
                        "opacity-30 cursor-not-allowed border-gray-200 text-gray-300 active:bg-white",
                    )}
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Cabin Class Radio List */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3">
            Select Cabin Class
          </h3>
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-1">
            {cabinOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLocalCabin(option.value)}
                className="w-full flex items-center justify-between py-3.5 border-b border-gray-100 last:border-none cursor-pointer group text-left"
              >
                <span
                  className={cn(
                    "text-sm font-bold transition-colors",
                    localCabin === option.value
                      ? "text-blue-600"
                      : "text-gray-700",
                  )}
                >
                  {option.label}
                </span>

                {/* Radio selection circle */}
                <span
                  className={cn(
                    "w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    localCabin === option.value
                      ? "border-blue-500"
                      : "border-gray-300",
                  )}
                >
                  {localCabin === option.value && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Footer */}
      <div className="shrink-0 border-t border-gray-100 p-4 bg-white flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors focus:outline-none cursor-pointer"
        >
          Reset
        </button>

        {/* Done */}
        <button
          type="button"
          onClick={handleDone}
          className="flex-[1.5] h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors focus:outline-none cursor-pointer shadow-md shadow-blue-200/50 flex items-center justify-center"
        >
          Done
        </button>
      </div>
    </div>
  );
}
