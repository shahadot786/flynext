'use client';

import { cn } from '@/shared/utils/cn';

type FullScreenLoaderProps = {
  message?: string;
  isVisible: boolean;
};

export function FullScreenLoader({
  message = 'Processing your booking...',
  isVisible,
}: FullScreenLoaderProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-white/95 animate-fade-in',
      )}
      role="status"
      aria-live="polite"
    >
      {/* Airplane container with overflow hidden for the fly animation */}
      <div className="w-48 h-16 overflow-hidden mb-6" aria-hidden="true">
        <svg
          className="h-16 w-16 text-primary-500 animate-fly"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="currentColor"
        >
          <path d="M60 28H44l-14-24h-6l7 24H15l-4-6H5l3 10-3 10h6l4-6h16l-7 24h6l14-24h16a4 4 0 0 0 0-8Z" />
        </svg>
      </div>

      {/* Message */}
      <p className="text-lg text-gray-600 font-medium mb-4">{message}</p>

      {/* Pulsing dots */}
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span
          className="h-2 w-2 rounded-full bg-primary-400 animate-bounce-subtle"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-primary-400 animate-bounce-subtle"
          style={{ animationDelay: '150ms' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-primary-400 animate-bounce-subtle"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  );
}
