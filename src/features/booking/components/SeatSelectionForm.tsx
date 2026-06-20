'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import type { SeatData } from '@/store/bookingStore';
import seatMapData from '@/data/seatMap.json';

// ─── Types ─────────────────────────────────────────────────

type SeatSelectionFormProps = {
  passengerLabels: string[];
  initialData?: SeatData[];
  onSubmit: (data: SeatData[]) => void;
};

type SeatStatus = 'available' | 'occupied' | 'selected' | 'exit' | 'premium';

// ─── Component ─────────────────────────────────────────────

export function SeatSelectionForm({
  passengerLabels,
  initialData,
  onSubmit,
}: SeatSelectionFormProps) {
  const [activePassenger, setActivePassenger] = useState(0);
  const [seats, setSeats] = useState<SeatData[]>(() =>
    initialData && initialData.length > 0
      ? initialData
      : passengerLabels.map(() => ({ seatNumber: '' })),
  );

  const allSelectedSeats = useMemo(
    () => seats.map((s) => s.seatNumber).filter(Boolean),
    [seats],
  );

  const getSeatStatus = (seatId: string): SeatStatus => {
    if (seatMapData.occupiedSeats.includes(seatId)) return 'occupied';
    if (allSelectedSeats.includes(seatId)) return 'selected';
    const row = parseInt(seatId, 10);
    if (seatMapData.exitRows.includes(row)) return 'exit';
    if (seatMapData.premiumRows.includes(row)) return 'premium';
    return 'available';
  };

  const handleSeatClick = (seatId: string) => {
    const status = getSeatStatus(seatId);
    if (status === 'occupied') return;

    // If clicking an already selected seat (by another passenger), don't allow
    const otherPaxSeat = seats.findIndex(
      (s, idx) => idx !== activePassenger && s.seatNumber === seatId,
    );
    if (otherPaxSeat !== -1) return;

    setSeats((prev) =>
      prev.map((item, idx) =>
        idx === activePassenger
          ? { seatNumber: item.seatNumber === seatId ? '' : seatId }
          : item,
      ),
    );
  };

  const handleSubmit = () => {
    onSubmit(seats);
  };

  const columns = seatMapData.columns;
  const currentSeat = seats[activePassenger];

  return (
    <div className="w-full" id="seat-form">
      {/* Header */}
      <h2 className="text-lg font-extrabold text-gray-900 mb-2">
        Seat Selection
      </h2>
      <p className="text-xs text-gray-500 font-medium mb-5">
        Choose your preferred seat. Skip this step for auto-assignment.
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
              {seats[i]?.seatNumber && (
                <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {seats[i].seatNumber}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected seat display */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-3.5 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary-800">
            {passengerLabels[activePassenger]}
          </p>
          <p className="text-sm font-extrabold text-primary-600 mt-0.5">
            {currentSeat?.seatNumber ? `Seat ${currentSeat.seatNumber}` : 'No seat selected'}
          </p>
        </div>
        {currentSeat?.seatNumber && (
          <button
            type="button"
            onClick={() =>
              setSeats((prev) =>
                prev.map((item, idx) =>
                  idx === activePassenger ? { seatNumber: '' } : item,
                ),
              )
            }
            className="text-xs font-bold text-red-500 hover:text-red-600 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        {[
          { color: 'bg-emerald-400', label: 'Available' },
          { color: 'bg-gray-300', label: 'Occupied' },
          { color: 'bg-primary-500', label: 'Selected' },
          { color: 'bg-amber-400', label: 'Exit Row' },
          { color: 'bg-violet-400', label: 'Premium' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('h-3.5 w-3.5 rounded-sm', color)} />
            <span className="text-[10px] font-bold text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Seat Grid */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-x-auto">
        {/* Column headers */}
        <div className="flex items-center justify-center gap-1 mb-2">
          <div className="w-8" /> {/* Row number spacer */}
          {columns.map((col, i) =>
            col === '' ? (
              <div key={`aisle-${i}`} className="w-4" />
            ) : (
              <div key={col} className="w-8 text-center text-[10px] font-extrabold text-gray-400">
                {col}
              </div>
            ),
          )}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {Array.from({ length: seatMapData.rows }).map((_, rowIdx) => {
            const rowNum = rowIdx + 1;

            return (
              <div key={rowNum} className="flex items-center justify-center gap-1">
                <div className="w-8 text-center text-[10px] font-bold text-gray-400">{rowNum}</div>
                {columns.map((col, colIdx) => {
                  if (col === '') {
                    return <div key={`aisle-${rowNum}-${colIdx}`} className="w-4" />;
                  }

                  const seatId = `${rowNum}${col}`;
                  const status = getSeatStatus(seatId);
                  const isCurrentlySelected = currentSeat?.seatNumber === seatId;

                  return (
                    <button
                      key={seatId}
                      type="button"
                      onClick={() => handleSeatClick(seatId)}
                      disabled={status === 'occupied'}
                      className={cn(
                        'w-8 h-7 rounded-t-lg text-[9px] font-bold transition-all border',
                        status === 'occupied' &&
                          'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60',
                        status === 'selected' &&
                          'bg-primary-500 border-primary-600 text-white shadow-md cursor-pointer',
                        isCurrentlySelected &&
                          'bg-primary-600 border-primary-700 text-white ring-2 ring-primary-300 shadow-lg cursor-pointer',
                        status === 'available' &&
                          'bg-emerald-400 border-emerald-500 text-white hover:bg-emerald-500 cursor-pointer',
                        status === 'exit' &&
                          !isCurrentlySelected &&
                          'bg-amber-400 border-amber-500 text-white hover:bg-amber-500 cursor-pointer',
                        status === 'premium' &&
                          !isCurrentlySelected &&
                          'bg-violet-400 border-violet-500 text-white hover:bg-violet-500 cursor-pointer',
                      )}
                      title={seatId}
                    >
                      {status === 'occupied' ? '×' : ''}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Exit row labels */}
        {seatMapData.exitRows.length > 0 && (
          <div className="mt-3 text-center text-[10px] font-bold text-amber-600">
            EXIT rows: {seatMapData.exitRows.join(', ')}
          </div>
        )}
      </div>

      {/* Skip button */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setSeats(passengerLabels.map(() => ({ seatNumber: '' })));
            onSubmit(passengerLabels.map(() => ({ seatNumber: '' })));
          }}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 cursor-pointer underline"
        >
          Skip seat selection — auto-assign at check-in
        </button>
      </div>

      {/* Hidden submit trigger */}
      <button type="button" id="seat-submit" className="hidden" onClick={handleSubmit} />
    </div>
  );
}
