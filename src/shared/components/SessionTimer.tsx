"use client";

import { useEffect, useState } from "react";

type SessionTimerProps = {
  startedAt?: number | null;
  initialMinutes?: number;
  onExpire?: () => void;
  isLoading?: boolean;
  variant?: "card" | "bar" | "inline";
};

export function SessionTimer({
  startedAt,
  initialMinutes = 30,
  onExpire,
  isLoading = false,
  variant = "card",
}: SessionTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (startedAt) {
      const elapsedMs = Date.now() - startedAt;
      const totalMs = initialMinutes * 60 * 1000;
      return Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));
    }
    return initialMinutes * 60;
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Check if already expired on mount/updates
    const initialElapsedMs = startedAt ? Date.now() - startedAt : 0;
    const initialTotalMs = initialMinutes * 60 * 1000;
    const initialLeft = startedAt
      ? Math.max(0, Math.floor((initialTotalMs - initialElapsedMs) / 1000))
      : initialMinutes * 60;

    if (initialLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        let nextValue = prev - 1;
        if (startedAt) {
          const elapsedMs = Date.now() - startedAt;
          const totalMs = initialMinutes * 60 * 1000;
          nextValue = Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));
        }
        if (nextValue <= 0) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return nextValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, onExpire, initialMinutes, startedAt]);

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

  if (variant === "inline") {
    return (
      <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200 text-xs font-bold shadow-sm select-none">
        <svg
          className="h-3.5 w-3.5 text-amber-500 shrink-0"
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
        <span>
          Session expires in:{" "}
          <span className="tabular-nums font-extrabold">{timeStr}</span>
        </span>
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
