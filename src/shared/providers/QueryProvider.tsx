'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,    // Data fresh for 5 minutes
            gcTime: 30 * 60 * 1000,       // Keep in cache for 30 minutes
            retry: 2,                      // Retry failed requests twice
            retryDelay: (attempt) =>
              Math.min(1000 * 2 ** attempt, 10000), // Exponential backoff
            refetchOnWindowFocus: false,   // Don't refetch when user switches tabs
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
