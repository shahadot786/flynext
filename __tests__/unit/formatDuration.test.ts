import { describe, test, expect } from 'vitest';
import { formatDuration } from '../../src/shared/utils/formatDuration';

describe('formatDuration', () => {
  test('formats minutes into hours and minutes correctly', () => {
    expect(formatDuration(145)).toBe('2h 25m');
    expect(formatDuration(60)).toBe('1h 0m');
    expect(formatDuration(30)).toBe('0h 30m');
    expect(formatDuration(0)).toBe('0h 0m');
    expect(formatDuration(605)).toBe('10h 5m');
  });
});
