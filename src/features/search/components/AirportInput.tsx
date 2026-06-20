"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/shared/utils/cn";
import { useDebounce } from "@/shared/hooks/useDebounce";
import airportsData from "@/data/airports.json";

type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};

type AirportInputProps = {
  label?: string;
  value: string;
  onChange: (code: string, airport: Airport) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  placeholderLabel?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "value" | "onChange">;

const airports: Airport[] = airportsData;

export function AirportInput({
  value,
  onChange,
  placeholder = "City or airport",
  error,
  className,
  placeholderLabel = "Departure",
  ...rest
}: AirportInputProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 150);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find selected airport details
  const selectedAirport = useMemo(() => {
    if (!value) return null;
    return airports?.find((a) => a?.code === value) || null;
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
        setQuery(""); // Reset query to revert to selected airport card on click outside
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside); // cleanup
  }, []);

  const filteredAirports = useMemo(() => {
    if (debouncedQuery.length > 0) {
      const q = debouncedQuery.toLowerCase();
      return airports.filter(
        (airport) =>
          airport.city.toLowerCase().includes(q) ||
          airport.code.toLowerCase().includes(q) ||
          airport.name.toLowerCase().includes(q) ||
          airport.country.toLowerCase().includes(q),
      );
    }
    return airports;
  }, [debouncedQuery]);

  function handleSelect(airport: Airport) {
    onChange(airport?.code, airport);
    setQuery("");
    setIsOpen(false);
    setIsFocused(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setIsOpen(true);
  }

  function handleFocus() {
    setIsFocused(true);
    setIsOpen(true);
    setQuery("");
  }

  function handleBlur(e: React.FocusEvent) {
    // Revert to selected airport card if focus leaves the airport input container
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setIsFocused(false);
      setQuery("");
    }
  }

  // Determine whether to show the search input field or the card view
  const showSearchInput = isFocused || isOpen || query.length > 0;

  return (
    <div ref={containerRef} className={cn("relative w-full h-18", className)}>
      {showSearchInput ? (
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus
          className={cn(
            "w-full h-full rounded-xl border px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-200",
            error
              ? "border-red-500 ring-1 ring-red-500"
              : "border-primary-500 ring-2 ring-primary-100",
          )}
          {...rest}
        />
      ) : (
        <div
          onClick={() => {
            setIsFocused(true);
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={cn(
            "w-full h-full rounded-xl flex items-center px-4 cursor-pointer transition-all duration-200",
            "bg-white border border-gray-200 hover:border-gray-300",
            error ? "ring-1 ring-red-500 border-red-500" : "",
          )}
        >
          {selectedAirport ? (
            <>
              {/* Left: Code */}
              <div className="text-xl font-bold text-gray-800 tracking-wide w-14 shrink-0 flex items-center justify-center">
                {selectedAirport.code}
              </div>
              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-3 shrink-0" />
              {/* Right: Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {selectedAirport.city}
                </div>
                <div className="text-[11px] text-gray-500 truncate mt-0.5">
                  {selectedAirport.country}, {selectedAirport.name}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Empty state */}
              <div className="text-xl font-bold text-gray-300 tracking-wide w-14 shrink-0 flex items-center justify-center">
                Select
              </div>
              {/* Divider */}
              <div className="h-8 w-px bg-gray-200 mx-3 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-400">
                  {placeholderLabel}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Choose city or airport
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="absolute left-2 -bottom-5 text-[10px] text-red-500 truncate max-w-[calc(100%-16px)] z-30">
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg animate-fade-in left-0">
          {filteredAirports.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              No airports found
            </div>
          ) : (
            filteredAirports.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => handleSelect(airport)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                  "hover:bg-primary-50",
                  value === airport.code && "bg-primary-50",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-xs font-bold text-primary-700 shrink-0">
                  {airport.code}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {airport.name}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
