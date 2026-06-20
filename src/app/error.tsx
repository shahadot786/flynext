'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md text-center max-w-md w-full">
        <div className="h-16 w-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Something Went Wrong</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          We encountered an unexpected error while processing your request. Please try reloading the page or return home.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase shadow-md transition-all cursor-pointer text-center"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase transition-all text-center cursor-pointer"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
