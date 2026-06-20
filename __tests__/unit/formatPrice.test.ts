import { describe, test, expect } from 'vitest';
import { formatPrice } from '../../src/shared/utils/formatPrice';

describe('formatPrice', () => {
  test('formats BDT with Bangladeshi numbering system (en-IN comma formatting)', () => {
    // ৳32,500
    expect(formatPrice(32500)).toBe('৳32,500');
    // ৳1,80,000 (Bangladeshi numbering system format: last 3 digits, then groups of 2)
    // Note: en-IN standard formats 180000 as 1,80,000.
    expect(formatPrice(180000)).toBe('৳1,80,000');
  });

  test('formats USD and other currencies standard style', () => {
    // Note: Intl.NumberFormat standard USD format uses $ symbol
    const usd = formatPrice(150, 'USD');
    expect(usd).toContain('$');
    expect(usd).toContain('150');
  });
});
