"use client";

import { useMemo } from "react";
import { cn } from "@/shared/utils/cn";

type DatePickerProps = {
  value: string;
  placeholderLabel?: string;
  disabled?: boolean;
  error?: string;
  onClick?: () => void;
  className?: string;
};

export function DatePicker({
  value,
  placeholderLabel = "Departure",
  disabled = false,
  error,
  onClick,
  className,
}: DatePickerProps) {
  // Parse the date manually to avoid timezone shifting
  const dateInfo = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const yearStr = parts[0];
    const monthStr = parts[1];
    const dayStr = parts[2];
    if (!yearStr || !monthStr || !dayStr) return null;

    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const dateObj = new Date(year, month - 1, day);
    if (isNaN(dateObj.getTime())) return null;

    return {
      day: dayStr.padStart(2, "0"),
      month: dateObj.toLocaleDateString("en-US", { month: "long" }),
      weekdayYear: `${dateObj.toLocaleDateString("en-US", { weekday: "long" })}, ${year}`,
    };
  }, [value]);

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative w-full h-18 cursor-pointer select-none",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {/* Styled card display */}
      <div
        className={cn(
          "absolute inset-0 w-full h-full rounded-xl flex items-center px-4 transition-all duration-200 pointer-events-none",
          "bg-white border border-gray-200 hover:border-gray-300",
          disabled
            ? "opacity-60 bg-gray-50/50"
            : error
              ? "ring-1 ring-red-500 border-red-500"
              : "",
        )}
      >
        {dateInfo ? (
          <>
            {/* Left: day code */}
            <div className="text-xl font-bold text-gray-800 tracking-wide w-10 shrink-0 flex items-center justify-center">
              {dateInfo.day}
            </div>
            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 mx-3 shrink-0" />
            {/* Right: details */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 truncate">
                {dateInfo.month}
              </div>
              <div className="text-[11px] text-gray-500 truncate mt-0.5">
                {dateInfo.weekdayYear}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Empty State */}
            <div className="text-xl font-bold text-gray-300 tracking-wide w-10 shrink-0 flex items-center justify-center">
              --
            </div>
            {/* Divider */}
            <div className="h-8 w-px bg-gray-200 mx-3 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-400">
                Select Date
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                {placeholderLabel}
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="absolute left-2 -bottom-5 text-[10px] text-red-500 truncate max-w-[calc(100%-16px)] z-30">
          {error}
        </p>
      )}
    </div>
  );
}
