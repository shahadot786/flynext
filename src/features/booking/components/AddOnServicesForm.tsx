'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatPrice } from '@/shared/utils/formatPrice';
import type { AddOnData } from '@/store/bookingStore';
import mealsData from '@/data/meals.json';
import insuranceData from '@/data/insurance.json';

// ─── Types ─────────────────────────────────────────────────

type AddOnServicesFormProps = {
  passengerLabels: string[];
  initialData?: AddOnData[];
  onSubmit: (data: AddOnData[]) => void;
};

// ─── Component ─────────────────────────────────────────────

export function AddOnServicesForm({
  passengerLabels,
  initialData,
  onSubmit,
}: AddOnServicesFormProps) {
  const [activePassenger, setActivePassenger] = useState(0);
  const [addOns, setAddOns] = useState<AddOnData[]>(() =>
    initialData && initialData.length > 0
      ? initialData
      : passengerLabels.map(() => ({
          mealType: 'standard',
          wheelchairRequired: false,
          insuranceId: 'none',
          specialRequests: '',
        })),
  );

  const currentAddOn = addOns[activePassenger];

  const updateField = <K extends keyof AddOnData>(key: K, value: AddOnData[K]) => {
    setAddOns((prev) =>
      prev.map((item, idx) =>
        idx === activePassenger ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleSubmit = () => {
    onSubmit(addOns);
  };

  const selectedInsurance = useMemo(
    () => insuranceData.find((ins) => ins.id === currentAddOn?.insuranceId),
    [currentAddOn?.insuranceId],
  );

  if (!currentAddOn) return null;

  return (
    <div className="w-full" id="addon-form">
      {/* Header */}
      <h2 className="text-lg font-extrabold text-gray-900 mb-5">
        Add-On Services
      </h2>

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

      {/* ── Meal Selection ─────────────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-base">🍽️</span>
          Meal Preference
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mealsData.map((meal) => (
            <button
              key={meal.id}
              type="button"
              onClick={() => updateField('mealType', meal.id)}
              className={cn(
                'border rounded-xl p-3.5 text-left transition-all cursor-pointer',
                currentAddOn.mealType === meal.id
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
              )}
            >
              <div className="text-xl mb-1.5">{meal.icon}</div>
              <p className="text-xs font-bold text-gray-800">{meal.name}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5 leading-snug">{meal.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Travel Insurance ───────────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-base">🛡️</span>
          Travel Insurance
        </h3>
        <div className="space-y-3">
          {insuranceData.map((ins) => (
            <button
              key={ins.id}
              type="button"
              onClick={() => updateField('insuranceId', ins.id)}
              className={cn(
                'w-full border rounded-xl p-4 text-left transition-all cursor-pointer',
                currentAddOn.insuranceId === ins.id
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                      currentAddOn.insuranceId === ins.id
                        ? 'border-primary-500'
                        : 'border-gray-300',
                    )}
                  >
                    {currentAddOn.insuranceId === ins.id && (
                      <div className="h-2 w-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{ins.name}</span>
                </div>
                {ins.price.amount > 0 && (
                  <span className="text-sm font-extrabold text-primary-600">
                    {formatPrice(ins.price.amount)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 font-medium pl-6">{ins.description}</p>
              {ins.features.length > 0 && currentAddOn.insuranceId === ins.id && (
                <ul className="mt-2 pl-6 space-y-1">
                  {ins.features.map((feature) => (
                    <li key={feature} className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5">
                      <svg className="h-3 w-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Wheelchair Assistance ──────────────────── */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-base">♿</span>
          Wheelchair Assistance
        </h3>
        <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={currentAddOn.wheelchairRequired}
            onChange={(e) => updateField('wheelchairRequired', e.target.checked)}
            className="h-4.5 w-4.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
          />
          <div>
            <p className="text-sm font-bold text-gray-800">I need wheelchair assistance</p>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Wheelchair service at the airport (no extra charge)
            </p>
          </div>
        </label>
      </div>

      {/* ── Special Requests ───────────────────────── */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-base">📝</span>
          Special Requests
        </h3>
        <textarea
          value={currentAddOn.specialRequests}
          onChange={(e) => updateField('specialRequests', e.target.value)}
          placeholder="Any special requests for your flight..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all resize-none"
        />
      </div>

      {/* Summary for selected insurance */}
      {selectedInsurance && selectedInsurance.price.amount > 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-2.5 text-xs font-bold text-emerald-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span>
            {selectedInsurance.name} insurance added — {formatPrice(selectedInsurance.price.amount)} per passenger
          </span>
        </div>
      )}

      {/* Hidden submit trigger */}
      <button type="button" id="addon-submit" className="hidden" onClick={handleSubmit} />
    </div>
  );
}
