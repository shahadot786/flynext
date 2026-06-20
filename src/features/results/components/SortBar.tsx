"use client";

import { cn } from "@/shared/utils/cn";
import type { SortOption } from "@/shared/types";
import { SORT_LABELS } from "@/shared/types";

// ─── Props ─────────────────────────────────────────────────

type SortBarProps = {
  sortOption: SortOption;
  onChange: (option: SortOption) => void;
  totalResults: number;
  className?: string;
};

// ─── Sort Options ──────────────────────────────────────────

const sortOptions = Object.keys(SORT_LABELS) as SortOption[];

// ─── Component ─────────────────────────────────────────────

export function SortBar({
  sortOption,
  onChange,
  totalResults,
  className,
}: SortBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl bg-white border border-gray-200 px-4 py-3",
        className,
      )}
    >
      {/* Result Count */}
      <p className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-semibold text-gray-900">{totalResults}</span>{" "}
        flight{totalResults !== 1 ? "s" : ""}
      </p>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-sm text-gray-500 shrink-0">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.22%208.22a.75.75%200%200%201%201.06%200L10%2011.94l3.72-3.72a.75.75%200%201%201%201.06%201.06l-4.25%204.25a.75.75%200%200%201-1.06%200L5.22%209.28a.75.75%200%200%201%200-1.06Z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-size-[1.25rem] bg-position-[right_0.375rem_center] bg-no-repeat"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              {SORT_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
