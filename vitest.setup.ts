console.log('--- VITEST SETUP IS RUNNING ---');
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

// Close server after all tests are completed
afterAll(() => server.close());

// Mock window.scrollTo since jsdom doesn't implement it
Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });

// Mock Next.js navigation hooks
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockBack = vi.fn();
const mockPrefetch = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      prefetch: mockPrefetch,
      refresh: mockRefresh,
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '',
  };
});
