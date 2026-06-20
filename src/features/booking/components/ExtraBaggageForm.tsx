'use client';

import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatPrice } from '@/shared/utils/formatPrice';
import type { BaggageData } from '@/store/bookingStore';
import baggageData from '@/data/baggageOptions.json';

// ─── Types ─────────────────────────────────────────────────

type ExtraBaggageFormProps = {
  passengerLabels: string[];
  initialData?: BaggageData[];
  cabin: string;
  onSubmit: (data: BaggageData[]) => void;
};

// ─── Included Baggage Labels ───────────────────────────────

function getIncludedBaggage(cabin: string) {
  switch (cabin) {
    case 'business':
      return { cabin: '10 Kg (1 piece)', checked: '35 Kg (2 pieces)' };
    case 'first':
      return { cabin: '10 Kg (1 piece)', checked: '40 Kg (2 pieces)' };
    default:
      return { cabin: '7 Kg (1 piece)', checked: '20 Kg (1 piece)' };
  }
}

// ─── Component ─────────────────────────────────────────────

export function ExtraBaggageForm({
  passengerLabels,
  initialData,
  cabin,
  onSubmit,
}: ExtraBaggageFormProps) {
  const [activePassenger, setActivePassenger] = useState(0);
  const [baggage, setBaggage] = useState<BaggageData[]>(() =>
    initialData && initialData.length > 0
      ? initialData
      : passengerLabels.map(() => ({ extraBaggageId: 'bag_0' })),
  );

  const included = getIncludedBaggage(cabin);
  const currentBag = baggage[activePassenger];

  const updateBaggage = (baggageId: string) => {
    setBaggage((prev) =>
      prev.map((item, idx) =>
        idx === activePassenger ? { extraBaggageId: baggageId } : item,
      ),
    );
  };

  const handleSubmit = () => {
    onSubmit(baggage);
  };

  if (!currentBag) return null;

  return (
    <div className="w-full" id="baggage-form">
      {/* Header */}
      <h2 className="text-lg font-extrabold text-gray-900 mb-2">
        Extra Baggage
      </h2>
      <p className="text-xs text-gray-500 font-medium mb-5">
        Add extra checked baggage to your booking. Pre-booking is cheaper than at the airport.
      </p>

      {/* Passenger tabs */}
      {passengerLabels.length > 1 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {passengerLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setActivePassenger(i)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border',
                i === activePassenger
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Included baggage info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <h3 className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
          Included with your ticket
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-2.5 border border-blue-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cabin</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{included.cabin}</p>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-blue-100">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Checked</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">{included.checked}</p>
          </div>
        </div>
      </div>

      {/* Baggage tier cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {baggageData.map((option) => {
          const isSelected = currentBag.extraBaggageId === option.id;
          const isFree = option.price.amount === 0;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateBaggage(option.id)}
              className={cn(
                'border rounded-xl p-4 text-center transition-all cursor-pointer relative',
                isSelected
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              )}

              {/* Baggage icon */}
              <div className="text-2xl mb-2">
                {isFree ? '✈️' : '🧳'}
              </div>
              <p className="text-sm font-extrabold text-gray-800">{option.label}</p>
              <p
                className={cn(
                  'text-xs font-bold mt-1',
                  isFree ? 'text-emerald-600' : 'text-primary-600',
                )}
              >
                {isFree ? 'Included' : formatPrice(option.price.amount)}
              </p>
            </button>
          );
        })}
      </div>

      {/* Hidden submit trigger */}
      <button type="button" id="baggage-submit" className="hidden" onClick={handleSubmit} />
    </div>
  );
}
