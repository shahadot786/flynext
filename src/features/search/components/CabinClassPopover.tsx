'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import type { CabinClass } from '@/shared/types';

type CabinClassPopoverProps = {
  value: CabinClass;
  onChange: (cabin: CabinClass) => void;
};

const cabinOptions: { value: CabinClass; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium-economy', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' },
];

export function CabinClassPopover({ value, onChange }: CabinClassPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100/80 transition-colors flex items-center gap-1.5 border-none shadow-none cursor-pointer"
      >
        <span>{cabinOptions.find((o) => o.value === value)?.label || 'Economy'}</span>
        <svg
          className={cn(
            'h-3.5 w-3.5 text-blue-500 transition-transform',
            isOpen && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-[calc(100vw-32px)] sm:w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-2 z-50 animate-fade-in">
          {cabinOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2.5 text-left text-sm font-semibold transition-colors cursor-pointer flex items-center',
                value === option.value
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {/* Radio Button Selector Icon */}
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2.5 shrink-0 transition-colors',
                  value === option.value ? 'border-blue-500' : 'border-gray-300',
                )}
              >
                {value === option.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
