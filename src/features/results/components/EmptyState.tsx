"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";

// ─── Props ─────────────────────────────────────────────────

type EmptyStateProps = {
  hasActiveFilters: boolean;
  onResetFilters?: () => void;
};

// ─── Component ─────────────────────────────────────────────

export function EmptyState({
  hasActiveFilters,
  onResetFilters,
}: EmptyStateProps) {
  const searchParams = useSearchParams();
  const modifyUrl = `/?${searchParams.toString()}`;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
      {/* Airplane Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
        <svg
          className="h-10 w-10 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">No flights found</h3>

      <p className="mt-2 max-w-sm text-sm text-gray-500 leading-relaxed">
        {hasActiveFilters
          ? "No flights match your current filters. Try adjusting or clearing them."
          : "We couldn't find flights for this route. Here are some suggestions:"}
      </p>

      {!hasActiveFilters && (
        <ul className="mt-4 space-y-1.5 text-sm text-gray-500">
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            Try different dates
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            Remove filters
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gray-300" />
            Increase your budget
          </li>
        </ul>
      )}

      <div className="mt-6 flex items-center gap-3">
        {hasActiveFilters && onResetFilters && (
          <Button
            variant="secondary"
            size="md"
            onClick={onResetFilters}
            className="cursor-pointer"
          >
            Clear all filters
          </Button>
        )}

        {/* Modify Search — always available, links back home */}
        <Link href={modifyUrl}>
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
