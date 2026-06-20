/**
 * Format minutes into a human-readable duration string.
 * @example formatDuration(145) → "2h 25m"
 * @example formatDuration(60) → "1h 0m"
 * @example formatDuration(30) → "0h 30m"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
