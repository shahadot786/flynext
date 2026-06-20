/**
 * Format a numeric amount as BDT currency string.
 * @example formatPrice(32500) → "৳32,500"
 * @example formatPrice(180000) → "৳1,80,000"
 */
export function formatPrice(amount: number, currency = 'BDT'): string {
  if (currency === 'BDT') {
    // Bangladeshi numbering system: last 3 digits, then groups of 2
    const formatted = amount.toLocaleString('en-IN');
    return `৳${formatted}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
