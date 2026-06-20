"use client";

import { useState, useMemo } from "react";
import { cn } from "@/shared/utils/cn";

type MobileDateBottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (date: string) => void;
  minDate: string;
  tripType: "one-way" | "round-trip" | "multi-city";
  title: string; // e.g. "Departure" or "Return"
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

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function MobileDateBottomSheet({
  isOpen,
  onClose,
  value,
  onChange,
  minDate,
  tripType,
  title,
}: MobileDateBottomSheetProps) {
  // Local state for the selected date string, initialized to the current prop value
  const [selectedDate, setSelectedDate] = useState(value);

  // Formatted date string for header
  const formattedDateString = useMemo(() => {
    const dateToFormat = selectedDate || value;
    if (!dateToFormat) return "";
    const parts = dateToFormat.split("-");
    if (parts.length !== 3) return "";
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return "";
    const dateObj = new Date(y, m - 1, d);
    if (isNaN(dateObj.getTime())) return "";

    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" });
    const weekdayShort = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
    });
    return `${d} ${monthShort}, ${weekdayShort}`;
  }, [selectedDate, value]);

  // Next 12 months list for vertical scrolling
  const monthsToRender = useMemo(() => {
    const list = [];
    const today = new Date();
    let currentM = today.getMonth();
    let currentY = today.getFullYear();
    for (let i = 0; i < 12; i++) {
      list.push({ month: currentM, year: currentY });
      currentM++;
      if (currentM > 11) {
        currentM = 0;
        currentY++;
      }
    }
    return list;
  }, []);

  // Helper to generate days in a month (same cell padding logic)
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();

    // Padding empty cells
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

    // Remaining cells padding (to form complete rows)
    const totalCells = Math.ceil(days.length / 7) * 7;
    const remaining = totalCells - days.length;
    for (let i = 0; i < remaining; i++) {
      days.push({
        dateStr: "",
        dayNum: 0,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateClick = (dateStr: string) => {
    if (!dateStr || dateStr < minDate) return;
    setSelectedDate(dateStr);
  };

  const handleDone = () => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    onClose();
  };

  const handleReset = () => {
    setSelectedDate("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-100 flex flex-col select-none animate-fade-in md:hidden">
      {/* 1. Header (Blue Banner) */}
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

        {/* Dynamic Title / Subtitle */}
        <div className="text-center flex-1">
          <h2 className="text-base font-bold tracking-wide">
            {formattedDateString
              ? `${title} on ${formattedDateString}`
              : `Select ${title} Date`}
          </h2>
          <p className="text-[10px] text-blue-100 font-medium tracking-wider uppercase mt-0.5">
            {tripType === "one-way"
              ? "Oneway"
              : tripType === "round-trip"
                ? "Round Trip"
                : "Multi City"}
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

      {/* 2. Scrollable Calendar Months */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {monthsToRender?.map(({ month, year }) => {
          const cells = getDaysInMonth(year, month);
          return (
            <div key={`${year}-${month}`} className="w-full">
              {/* Centered Month & Year */}
              <h3 className="text-center font-bold text-gray-800 text-sm mb-4">
                {MONTHS[month]} {year}
              </h3>

              {/* SUN-SAT Header Row */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 mb-3 tracking-wider">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 text-center text-sm font-semibold gap-y-2">
                {cells?.map((cell, idx) => {
                  const { dateStr, dayNum, isCurrentMonth } = cell;

                  if (!isCurrentMonth) {
                    return <div key={idx} className="h-10 w-full" />;
                  }

                  const isPast = dateStr < minDate;
                  const isDaySelected = selectedDate === dateStr;

                  return (
                    <div
                      key={idx}
                      className="h-10 w-full flex items-center justify-center relative"
                    >
                      <button
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDateClick(dateStr)}
                        className={cn(
                          "h-9 w-9 flex items-center justify-center rounded-full text-xs transition-colors cursor-pointer focus:outline-none relative",
                          isPast
                            ? "text-gray-200 cursor-not-allowed"
                            : isDaySelected
                              ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-200"
                              : "text-gray-700 active:bg-gray-100",
                        )}
                      >
                        {dayNum}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Subtle divider between months */}
              <div className="mt-8 border-b border-gray-100/60" />
            </div>
          );
        })}
      </div>

      {/* 3. Fixed Bottom Bar */}
      <div className="shrink-0 border-t border-gray-100 p-4 bg-white flex gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {/* Reset Button */}
        <button
          type="button"
          onClick={handleReset}
          className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors focus:outline-none cursor-pointer"
        >
          Reset
        </button>

        {/* Done Button */}
        <button
          type="button"
          onClick={handleDone}
          disabled={!selectedDate}
          className={cn(
            "flex-[1.5] h-12 rounded-xl font-bold text-sm transition-colors focus:outline-none cursor-pointer shadow-md flex items-center justify-center",
            selectedDate
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/50"
              : "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none",
          )}
        >
          Done
        </button>
      </div>
    </div>
  );
}
