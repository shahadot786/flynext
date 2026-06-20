"use client";

import { useEffect, useState } from "react";

type SessionExpiredModalProps = {
  isOpen: boolean;
  onAction?: () => void;
};

export function SessionExpiredModal({
  isOpen,
  onAction,
}: SessionExpiredModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onAction) {
            onAction();
          } else {
            window.location.href = "/";
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onAction]);

  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-up text-center flex flex-col items-center">
        {/* Warning Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Session Expired
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 font-semibold">
          Flight prices and availability are constantly changing. Please search
          again to get the latest flight updates.
        </p>
        <button
          type="button"
          onClick={handleAction}
          className="w-full rounded-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 shadow-md transition-colors cursor-pointer text-sm"
        >
          Search Again
        </button>
        <p className="text-xs text-gray-400 font-semibold mt-3.5 animate-pulse">
          Auto-redirecting to search in{" "}
          <span className="font-extrabold text-gray-500 tabular-nums">
            {secondsLeft}s
          </span>
          ...
        </p>
      </div>
    </div>
  );
}
