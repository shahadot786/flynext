"use client";

import { cn } from "@/shared/utils/cn";
import { BOOKING_STEPS } from "@/store/bookingStore";

// ─── Props ─────────────────────────────────────────────────

type BookingProgressProps = {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (stepId: number) => void;
};

// ─── Component ─────────────────────────────────────────────

export function BookingProgress({
  currentStep,
  completedSteps,
  onStepClick,
}: BookingProgressProps) {
  return (
    <>
      {/* ── Desktop Progress Bar ──────────────────────── */}
      <div className="hidden lg:flex items-center gap-0">
        {BOOKING_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isPast = step.id < currentStep;
          const isNavigable = step.id <= Math.max(...completedSteps, 0) + 1;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step pill */}
              <button
                type="button"
                disabled={!isNavigable}
                onClick={() => onStepClick?.(step.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap outline-none border-0",
                  isActive
                    ? "bg-blue-600 text-white shadow-md cursor-default"
                    : isCompleted || isPast
                      ? "bg-primary-100 text-primary-700 hover:bg-primary-200/80 cursor-pointer"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                    isActive
                      ? "bg-white text-blue-600"
                      : isCompleted || isPast
                        ? "bg-primary-500 text-white"
                        : "bg-gray-300 text-white",
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </span>
                <span>{step.label}</span>
              </button>

              {/* Connector line between steps */}
              {index < BOOKING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 mx-1 rounded-full",
                    isPast || isCompleted ? "bg-primary-300" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile Progress Bar ───────────────────────── */}
      <div className="lg:hidden flex items-center justify-between w-full px-4 py-2.5 bg-white border-b border-gray-100">
        {BOOKING_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.includes(step.id);
          const isPast = step.id < currentStep;
          const isNavigable = step.id <= Math.max(...completedSteps, 0) + 1;

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              <button
                type="button"
                disabled={!isNavigable}
                onClick={() => onStepClick?.(step.id)}
                className={cn(
                  "flex flex-col items-center text-center min-w-0 flex-1 outline-none border-0 bg-transparent transition-all",
                  isNavigable && !isActive
                    ? "cursor-pointer hover:opacity-85"
                    : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "text-[8px] font-extrabold leading-tight whitespace-pre-line",
                    isActive
                      ? "text-primary-600"
                      : isCompleted || isPast
                        ? "text-primary-500"
                        : "text-gray-400",
                  )}
                >
                  {step.shortLabel}
                </span>
                <div
                  className={cn(
                    "h-1 w-full mt-1.5 rounded-full",
                    isActive
                      ? "bg-blue-600"
                      : isCompleted || isPast
                        ? "bg-primary-400"
                        : "bg-gray-200",
                  )}
                />
              </button>
              {index < BOOKING_STEPS.length - 1 && (
                <svg
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 mx-0.5",
                    isPast ? "text-primary-400" : "text-gray-300",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
