import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, test, expect } from 'vitest';
import { ResultsClient } from '../../src/app/search/ResultsClient';

// Helper to render component with QueryClientProvider
const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('SearchFlow Integration', () => {
  const defaultProps = {
    origin: 'DAC',
    destination: 'CXB',
    date: '2026-06-20',
    adults: 1,
    childrenCount: 0,
    kids: 0,
    infants: 0,
    cabin: 'economy',
  };

  test('renders results page and fetches flights', async () => {
    renderWithClient(<ResultsClient {...defaultProps} />);

    // Shows loading skeletons first
    expect(screen.queryAllByText(/Available Flights/)).toHaveLength(0);

    // Wait for the mock API response to load flights
    await waitFor(() => {
      expect(screen.getAllByText(/Available Flights/)[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should display flight cards
    await waitFor(() => {
      expect(screen.getAllByText(/Biman Bangladesh Airlines/i)[0]).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('filters flights when checking stops options', async () => {
    renderWithClient(<ResultsClient {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Available Flights/)[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Let's find stops filters (Non-stop, 1 Stop, 2+ Stops)
    const nonStopCheckbox = screen.getByRole('checkbox', { name: /Non-stop/i });
    expect(nonStopCheckbox).toBeInTheDocument();

    // Check non-stop
    fireEvent.click(nonStopCheckbox);

    // Verify it updates and still shows non-stop flights
    await waitFor(() => {
      expect(screen.getAllByText(/Biman Bangladesh Airlines/i)[0]).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('updates sort option and updates sort UI', async () => {
    renderWithClient(<ResultsClient {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getAllByText(/Available Flights/)[0]).toBeInTheDocument();
    }, { timeout: 3000 });

    // Find the sort select element
    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toBeInTheDocument();

    // Change sort option to price high to low (price_desc)
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });

    // Verify select value changed
    expect(sortSelect).toHaveValue('price_desc');
  });
});

