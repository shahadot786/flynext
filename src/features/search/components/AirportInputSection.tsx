'use client';

import { AirportInput } from './AirportInput';

type AirportInputSectionProps = {
  origin: string;
  destination: string;
  onChangeOrigin: (code: string) => void;
  onChangeDestination: (code: string) => void;
  onSwap: () => void;
  errors: Record<string, string>;
};

export function AirportInputSection({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
  onSwap,
  errors,
}: AirportInputSectionProps) {
  return (
    <div className="relative flex flex-col sm:flex-row gap-3 lg:gap-0 flex-1 lg:w-[48%]">
      {/* Origin Airport Input */}
      <AirportInput
        placeholderLabel="Departure"
        value={origin}
        onChange={onChangeOrigin}
        placeholder="Departure city"
        error={errors.origin}
        className="w-full lg:w-1/2 lg:rounded-r-none"
      />

      {/* Absolute Swap Button */}
      <button
        type="button"
        onClick={onSwap}
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

      {/* Destination Airport Input */}
      <AirportInput
        placeholderLabel="Arrival"
        value={destination}
        onChange={onChangeDestination}
        placeholder="Arrival city"
        error={errors.destination}
        className="w-full lg:w-1/2 lg:rounded-l-none lg:border-l-0"
      />
    </div>
  );
}
