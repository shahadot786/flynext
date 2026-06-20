"use client";

import { useEffect, useState } from "react";

type SessionTimerProps = {
  initialMinutes?: number;
  onExpire: () => void;
  isLoading: boolean;
  variant?: "card" | "bar";
};

export function SessionTimer({
  initialMinutes = 30,
  onExpire,
  isLoading,
  variant = "card",
}: SessionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, onExpire, initialMinutes]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  if (variant === "bar") {
    return (
      <div className="bg-emerald-600 text-white py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5 w-full shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <span>Remaining {timeStr}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-primary-500">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-700">
          Time Remaining
        </span>
      </div>
      <span className="text-lg font-bold text-primary-600 tabular-nums">
        {timeStr}
      </span>
    </div>
  );
}
