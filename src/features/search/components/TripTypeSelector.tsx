'use client';

import { cn } from '@/shared/utils/cn';

type TripType = 'one-way' | 'round-trip' | 'multi-city';

type TripTypeSelectorProps = {
  value: TripType;
  onChange: (type: 'one-way' | 'round-trip') => void;
  variant?: 'desktop' | 'mobile';
};

export function TripTypeSelector({
  value,
  onChange,
  variant = 'desktop',
}: TripTypeSelectorProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex md:hidden items-center gap-5 mb-5 px-1">
        {/* One Way */}
        <button
          type="button"
          onClick={() => onChange('one-way')}
          className="flex items-center text-xs cursor-pointer select-none"
        >
          <span
            className={cn(
              'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0 transition-colors',
              value === 'one-way'
                ? 'border-blue-500 text-blue-600'
                : 'border-gray-300',
            )}
          >
            {value === 'one-way' && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </span>
          <span
            className={cn(
              'text-xs font-semibold',
              value === 'one-way' ? 'text-gray-900' : 'text-gray-500',
            )}
          >
            One Way
          </span>
        </button>

        {/* Round Trip */}
        <button
          type="button"
          onClick={() => onChange('round-trip')}
          className="flex items-center text-xs cursor-pointer select-none"
        >
          <span
            className={cn(
              'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0 transition-colors',
              value === 'round-trip'
                ? 'border-blue-500 text-blue-600'
                : 'border-gray-300',
            )}
          >
            {value === 'round-trip' && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            )}
          </span>
          <span
            className={cn(
              'text-xs font-semibold',
              value === 'round-trip' ? 'text-gray-900' : 'text-gray-500',
            )}
          >
            Round Trip
          </span>
        </button>

        {/* Multi City - Disabled */}
        <button
          type="button"
          disabled
          className="flex items-center text-xs cursor-not-allowed opacity-50 select-none"
        >
          <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2 shrink-0" />
          <span className="text-xs font-semibold text-gray-500">
            Multi City
          </span>
        </button>
      </div>
    );
  }

  // Desktop tab design
  return (
    <div className="flex items-center gap-2">
      {/* One Way */}
      <button
        key="one-way"
        type="button"
        onClick={() => onChange('one-way')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors cursor-pointer',
          value === 'one-way'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200',
        )}
      >
        <span
          className={cn(
            'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0',
            value === 'one-way' ? 'border-white' : 'border-gray-400',
          )}
        >
          {value === 'one-way' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </span>
        One Way
      </button>

      {/* Round Trip */}
      <button
        key="round-trip"
        type="button"
        onClick={() => onChange('round-trip')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-colors cursor-pointer',
          value === 'round-trip'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200',
        )}
      >
        <span
          className={cn(
            'w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center mr-2 shrink-0',
            value === 'round-trip' ? 'border-white' : 'border-gray-400',
          )}
        >
          {value === 'round-trip' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </span>
        Round Trip
      </button>

      {/* Multi City - Disabled */}
      <button
        key="multi-city"
        type="button"
        disabled
        className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed opacity-60"
        title="Multi City is not supported yet"
      >
        <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center mr-2 shrink-0" />
        Multi City
      </button>
    </div>
  );
}
