"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { FlightSearchError } from "@/shared/api/flightService";
import { ERROR_MESSAGES } from "@/shared/types";

// ─── Props ─────────────────────────────────────────────────

type ErrorStateProps = {
  error: Error | null;
  onRetry: () => void;
};

// ─── Component ─────────────────────────────────────────────

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const statusCode = error instanceof FlightSearchError ? error.status : 500;
  const message =
    ERROR_MESSAGES[statusCode] ??
    ERROR_MESSAGES[500] ??
    "Something went wrong.";

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/40 px-6 py-16 text-center">
      {/* Error Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <svg
          className="h-10 w-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">{message}</h3>

      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        {statusCode === 503
          ? "Our flight search service is experiencing high demand. Please wait a moment and try again."
          : "This could be a temporary issue. Please try again or modify your search."}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={onRetry}
          className="cursor-pointer"
        >
          Try Again
        </Button>

        <Link href="/">
          <Button
            size="md"
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white active:bg-emerald-800 shadow-sm"
          >
            Modify Search
          </Button>
        </Link>
      </div>
    </div>
  );
}
