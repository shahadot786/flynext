'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils/cn';
import { DatePicker } from './DatePicker';
import { CustomCalendar } from './CustomCalendar';

type DatePickerSectionProps = {
  departureDate: string;
  returnDate: string;
  onChangeDepartureDate: (date: string) => void;
  onChangeReturnDate: (date: string) => void;
  tripType: 'one-way' | 'round-trip' | 'multi-city';
  onChangeTripType: (type: 'one-way' | 'round-trip') => void;
  todayStr: string;
  errors: Record<string, string>;
  onOpenMobileDep: () => void;
  onOpenMobileRet: () => void;
};

export function DatePickerSection({
  departureDate,
  returnDate,
  onChangeDepartureDate,
  onChangeReturnDate,
  tripType,
  onChangeTripType,
  todayStr,
  errors,
  onOpenMobileDep,
  onOpenMobileRet,
}: DatePickerSectionProps) {
  const [isDepCalendarOpen, setIsDepCalendarOpen] = useState(false);
  const [isRetCalendarOpen, setIsRetCalendarOpen] = useState(false);

  const depCalendarRef = useRef<HTMLDivElement>(null);
  const retCalendarRef = useRef<HTMLDivElement>(null);

  // Close calendars on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        depCalendarRef.current &&
        !depCalendarRef.current.contains(event.target as Node)
      ) {
        setIsDepCalendarOpen(false);
      }
      if (
        retCalendarRef.current &&
        !retCalendarRef.current.contains(event.target as Node)
      ) {
        setIsRetCalendarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-1 lg:w-[42%]">
      {/* Departure Date Container */}
      <div ref={depCalendarRef} className="relative flex-1">
        <DatePicker
          placeholderLabel="Departure"
          value={departureDate}
          onClick={() => {
            if (window.innerWidth < 768) {
              onOpenMobileDep();
            } else {
              setIsDepCalendarOpen(true);
              setIsRetCalendarOpen(false);
            }
          }}
          error={errors.departureDate}
          className="w-full"
        />
        {isDepCalendarOpen && (
          <div
            className={cn(
              'absolute top-20 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in left-0',
              tripType === 'one-way'
                ? 'w-full sm:w-[320px]'
                : 'w-full sm:w-155 md:w-160',
            )}
          >
            <CustomCalendar
              value={departureDate}
              departureDate={departureDate}
              returnDate={returnDate}
              minDate={todayStr}
              tripType={tripType === 'one-way' ? 'one-way' : 'round-trip'}
              onChange={(date) => {
                onChangeDepartureDate(date);
                if (
                  tripType === 'round-trip' &&
                  returnDate &&
                  date > returnDate
                ) {
                  onChangeReturnDate(''); // Clear invalid range
                }
              }}
              onClose={() => setIsDepCalendarOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Return Date Container */}
      <div ref={retCalendarRef} className="relative flex-1">
        <div
          onClick={() => {
            if (tripType === 'one-way') {
              onChangeTripType('round-trip');
            }
          }}
          className="w-full"
        >
          <DatePicker
            placeholderLabel="Return"
            value={returnDate}
            onClick={() => {
              if (window.innerWidth < 768) {
                onOpenMobileRet();
              } else {
                setIsRetCalendarOpen(true);
                setIsDepCalendarOpen(false);
              }
            }}
            error={errors.returnDate}
            disabled={tripType === 'one-way'}
            className="w-full"
          />
        </div>
        {isRetCalendarOpen && (
          <div
            className={cn(
              'absolute top-20 bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 z-50 animate-fade-in right-0',
              tripType === 'one-way'
                ? 'w-full sm:w-[320px]'
                : 'w-full sm:w-155 md:w-160',
            )}
          >
            <CustomCalendar
              value={returnDate}
              departureDate={departureDate}
              returnDate={returnDate}
              minDate={departureDate || todayStr}
              tripType={tripType === 'one-way' ? 'one-way' : 'round-trip'}
              onChange={onChangeReturnDate}
              onClose={() => setIsRetCalendarOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
