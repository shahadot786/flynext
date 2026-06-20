import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Your Flight — FlyNext',
  description: 'Complete your flight booking with passenger details, add-ons, seat selection, and secure payment.',
};

export default function BookingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="booking-page-container min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
