'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/bookingStore';
import { BookingForm } from '@/features/booking/components/BookingForm';

export default function BookingPage() {
  const router = useRouter();
  const selectedFlight = useBookingStore((s) => s.selectedFlight);

  // Navigation guard: redirect if no flight selected
  useEffect(() => {
    if (!selectedFlight) {
      router.replace('/');
    }
  }, [selectedFlight, router]);

  if (!selectedFlight) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-3 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-semibold">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <BookingForm />;
}
