"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/shared/utils/cn";
import type { PassengerCount } from "@/shared/types";

type PassengerSelectorProps = {
  value: PassengerCount;
  onChange: (count: PassengerCount) => void;
  error?: string;
  className?: string;
  variant?: "default" | "pill" | "mobile-left-card" | "mobile-pill";
};

type PassengerType = keyof PassengerCount;

export function PassengerSelector({
  value,
  onChange,
  error,
  className,
  variant = "default",
}: PassengerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPassengers =
    value.adults + value.children + (value.kids ?? 0) + value.infants;

  // Build display text
  const displayText = useMemo(() => {
    if (variant === "pill" || variant === "mobile-pill") {
      return `${totalPassengers} Passenger${totalPassengers > 1 ? "s" : ""}`;
    }
    if (variant === "mobile-left-card") {
      const parts: string[] = [];
      if (value.adults > 0)
        parts.push(`${value.adults} Adult${value.adults > 1 ? "s" : ""}`);
      if (value.children > 0)
        parts.push(`${value.children} Child${value.children > 1 ? "ren" : ""}`);
      if ((value.kids ?? 0) > 0)
        parts.push(`${value.kids} Kid${(value.kids ?? 0) > 1 ? "s" : ""}`);
      if (value.infants > 0)
        parts.push(`${value.infants} Infant${value.infants > 1 ? "s" : ""}`);
      return parts.join(", ") || "1 Adult";
    }
    const parts: string[] = [];
    if (value.adults > 0)
      parts.push(`${value.adults} Adult${value.adults > 1 ? "s" : ""}`);
    if (value.children > 0)
      parts.push(`${value.children} Child${value.children > 1 ? "ren" : ""}`);
    if ((value.kids ?? 0) > 0)
      parts.push(`${value.kids} Kid${(value.kids ?? 0) > 1 ? "s" : ""}`);
    if (value.infants > 0)
      parts.push(`${value.infants} Infant${value.infants > 1 ? "s" : ""}`);
    return parts.join(", ") || "1 Adult";
  }, [value, variant, totalPassengers]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(type: PassengerType, delta: number) {
    const config = passengerTypes.find((p) => p.key === type);
    if (!config) return;

    const currentValue = value[type] ?? 0;
    const newValue = currentValue + delta;
    if (newValue < config.min || newValue > config.max) return;

    // Infants cannot exceed adults
    if (type === "infants" && newValue > value.adults) return;

    // Adjust infants if adults decrease
    let newInfants = value.infants;
    if (type === "adults" && value.infants > newValue) {
      newInfants = newValue;
    }

    onChange({
      ...value,
      adults: type === "adults" ? newValue : value.adults,
      children: type === "children" ? newValue : value.children,
      kids: type === "kids" ? newValue : (value.kids ?? 0),
      infants: type === "infants" ? newValue : newInfants,
    });
  }

  // Icons matching the passenger types
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

  const isPill = variant === "pill";
  const isMobileCard = variant === "mobile-left-card";
  const isMobilePill = variant === "mobile-pill";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {!isPill && !isMobileCard && !isMobilePill && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Passengers
        </label>
      )}

      {isMobileCard ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-full bg-transparent flex items-center px-4 cursor-pointer outline-none border-none shadow-none focus:outline-none"
        >
          <div className="text-xl font-bold text-gray-800 tracking-wide w-10 shrink-0 flex items-center justify-center">
            {totalPassengers.toString().padStart(2, "0")}
          </div>
          <div className="h-8 w-px bg-gray-300 mx-3 shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-semibold text-gray-800 truncate">
              Passenger
            </div>
            <div className="text-[11px] text-gray-500 truncate mt-0.5">
              {displayText}
            </div>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "transition-colors outline-none flex items-center justify-between gap-1.5",
            isMobilePill
              ? "w-full py-2.5 px-3 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs hover:bg-blue-100/80 cursor-pointer border-none shadow-none"
              : isPill
                ? "px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100/80 cursor-pointer border-none shadow-none"
                : cn(
                    "w-full h-11 rounded-lg border px-3 text-left text-sm text-gray-900 bg-white",
                    "focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
                    error
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-200",
                  ),
          )}
        >
          <span className="truncate">{displayText}</span>
          <svg
            className={cn(
              isPill || isMobilePill
                ? "h-3.5 w-3.5 text-blue-500"
                : "h-4 w-4 text-gray-400",
              "transition-transform",
              isOpen && "rotate-180",
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
      )}

      {!isPill && !isMobileCard && !isMobilePill && error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 rounded-xl border border-gray-200 bg-white shadow-lg p-4 animate-fade-in",
            isPill || isMobilePill
              ? "w-[calc(100vw-32px)] sm:w-72 max-w-sm left-0 sm:left-auto sm:right-0"
              : isMobileCard
                ? "w-[calc(100vw-48px)] sm:w-72 max-w-sm -left-4 sm:left-0"
                : "w-full left-0",
          )}
        >
          {passengerTypes.map(({ key, label, sublabel, min, max, icon }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChange(key, -1)}
                  disabled={(value[key] ?? 0) <= min}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-blue-500 text-blue-500 text-lg font-semibold transition-colors bg-white cursor-pointer",
                    "hover:bg-blue-50 focus:outline-none",
                    (value[key] ?? 0) <= min &&
                      "opacity-30 cursor-not-allowed border-gray-200 text-gray-300 hover:bg-white",
                  )}
                  aria-label={`Decrease ${label.toLowerCase()}`}
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold text-gray-900">
                  {value[key] ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleChange(key, 1)}
                  disabled={(value[key] ?? 0) >= max || totalPassengers >= 9}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border border-blue-500 text-blue-500 text-lg font-semibold transition-colors bg-white cursor-pointer",
                    "hover:bg-blue-50 focus:outline-none",
                    ((value[key] ?? 0) >= max || totalPassengers >= 9) &&
                      "opacity-30 cursor-not-allowed border-gray-200 text-gray-300 hover:bg-white",
                  )}
                  aria-label={`Increase ${label.toLowerCase()}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full h-10 rounded-lg border border-blue-500 text-blue-500 text-sm font-semibold bg-white hover:bg-blue-50/50 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
