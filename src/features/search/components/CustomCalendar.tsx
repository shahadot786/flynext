"use client";

import { useState, useMemo } from "react";
import { cn } from "@/shared/utils/cn";

type CalendarDay = {
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
};

type CustomCalendarProps = {
  value: string;
  departureDate: string;
  returnDate: string;
  minDate: string;
  onChange: (date: string) => void;
  tripType: "one-way" | "round-trip";
  onClose: () => void;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export function CustomCalendar({
  value,
  departureDate,
  returnDate,
  minDate,
  onChange,
  tripType,
  onClose,
}: CustomCalendarProps) {
  // Track the visible months using left-most month state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const initialDate = value ? new Date(value) : new Date();
    return initialDate.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const initialDate = value ? new Date(value) : new Date();
    return initialDate.getFullYear();
  });

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Helper to generate calendar grid cells (42 cells total)
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();

    // Empty cells for alignment
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: "",
        dayNum: 0,
        isCurrentMonth: false,
      });
    }

    const daysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysCount; i++) {
      const mm = (month + 1).toString().padStart(2, "0");
      const dd = i.toString().padStart(2, "0");
      const dateStr = `${year}-${mm}-${dd}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Pad remaining cells
    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({
        dateStr: "",
        dayNum: 0,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const leftMonthDays = useMemo(
    () => getDaysInMonth(currentYear, currentMonth),
    [currentYear, currentMonth],
  );

  const rightMonthInfo = useMemo(() => {
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return {
      month: nextMonth,
      year: nextYear,
      days: getDaysInMonth(nextYear, nextMonth),
    };
  }, [currentYear, currentMonth]);

  const handleDateClick = (dateStr: string) => {
    if (!dateStr || dateStr < minDate) return;

    onChange(dateStr);

    if (tripType === "one-way") {
      onClose();
    }
  };

  const isSelected = (dateStr: string) => {
    return (
      dateStr &&
      (dateStr === departureDate ||
        (tripType === "round-trip" && dateStr === returnDate))
    );
  };

  const isInRange = (dateStr: string) => {
    return (
      tripType === "round-trip" &&
      departureDate &&
      returnDate &&
      dateStr &&
      dateStr > departureDate &&
      dateStr < returnDate
    );
  };

  const renderMonth = (
    monthIndex: number,
    yearNum: number,
    cells: CalendarDay[],
  ) => {
    return (
      <div className="w-full">
        {/* Month Name Header */}
        <div className="text-center font-bold text-gray-800 text-sm mb-4">
          {MONTHS[monthIndex]} {yearNum}
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-semibold text-gray-400 mb-2">
          {DAYS_OF_WEEK.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        {/* Grid of days */}
        <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
          {cells?.map((cell, idx) => {
            const { dateStr, dayNum, isCurrentMonth } = cell;

            if (!isCurrentMonth) {
              return <div key={idx} className="h-9 w-full" />;
            }

            const isPast = dateStr < minDate;
            const selected = isSelected(dateStr);
            const inRange = isInRange(dateStr);
            const isStart = dateStr === departureDate;
            const isEnd = tripType === "round-trip" && dateStr === returnDate;

            return (
              <div
                key={idx}
                className={cn(
                  "h-9 w-full relative flex items-center justify-center font-medium",
                  inRange && "bg-blue-50 text-blue-700",
                  isStart &&
                    returnDate &&
                    "before:absolute before:right-0 before:top-0 before:bottom-0 before:left-1/2 before:bg-blue-50 before:-z-10",
                  isEnd &&
                    departureDate &&
                    "before:absolute before:left-0 before:top-0 before:bottom-0 before:right-1/2 before:bg-blue-50 before:-z-10",
                )}
              >
                <button
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dateStr)}
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-full text-xs transition-colors cursor-pointer focus:outline-none relative z-10",
                    isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : selected
                        ? "bg-blue-600 text-white font-bold"
                        : inRange
                          ? "text-blue-700 hover:bg-blue-100"
                          : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  {dayNum}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isRoundTrip = tripType === "round-trip";
  const showApply = isRoundTrip;
  const isApplyDisabled = isRoundTrip && (!departureDate || !returnDate);

  return (
    <div className="flex flex-col h-full select-none">
      {/* Month layout wrapper */}
      <div className="relative flex flex-col md:flex-row gap-8 items-start">
        {/* Navigation Arrows positioned absolutely overlaying month headers */}
        <button
          type="button"
          onClick={handlePrevMonth}
          className="absolute left-1 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer z-20 focus:outline-none"
        >
          &lt;
        </button>

        <button
          type="button"
          onClick={handleNextMonth}
          className="absolute right-1 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer z-20 focus:outline-none"
        >
          &gt;
        </button>

        {/* Left Month */}
        <div className="flex-1 min-w-65 pt-1">
          {renderMonth(currentMonth, currentYear, leftMonthDays)}
        </div>

        {/* Right Month (Round Trip only) */}
        {isRoundTrip && (
          <div className="flex-1 min-w-65 pt-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-8">
            {renderMonth(
              rightMonthInfo.month,
              rightMonthInfo.year,
              rightMonthInfo.days,
            )}
          </div>
        )}
      </div>

      {/* Footer / Apply Button (Round trip only) */}
      {showApply && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            disabled={isApplyDisabled}
            onClick={onClose}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none cursor-pointer",
              isApplyDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100",
            )}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
