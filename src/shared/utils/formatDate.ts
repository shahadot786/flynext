/**
 * Date & Time Formatting Utilities
 */

function formatDateWithOptions(
  dateString: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", options);
}

function formatTimeWithOptions(
  dateString: string | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleTimeString("en-US", options);
}

export const formatDate = (dateString: string): string =>
  formatDateWithOptions(dateString, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatDateShort = (dateString: string): string =>
  formatDateWithOptions(dateString, {
    month: "short",
    day: "numeric",
  });

export const getDayOfWeek = (dateString: string): string =>
  formatDateWithOptions(dateString, {
    weekday: "long",
  });

export const formatTime = (dateString: string): string =>
  formatTimeWithOptions(dateString, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatTicketDate = (dateString?: string): string =>
  formatDateWithOptions(dateString, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatTicketDateShort = (dateString?: string): string =>
  formatDateWithOptions(dateString, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const formatTicketTime = (dateString?: string): string =>
  formatTimeWithOptions(dateString, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

// Reuse for booking dates/times instead of separate implementations
export const formatBookingDate = (dateString: string): string =>
  formatDateWithOptions(dateString, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const formatBookingTime = (dateString: string): string =>
  formatTimeWithOptions(dateString, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
