/** Returns true if the given date is strictly in the future (> now UTC). */
export function isFutureDate(date: Date): boolean {
  return date.getTime() > Date.now();
}

/** Returns true if the given date is in the past or present (<= now UTC). */
export function isPastDate(date: Date): boolean {
  return date.getTime() <= Date.now();
}

/** Returns true if the submission window is currently open. */
export function isWindowOpen(opensAt: Date, closesAt: Date): boolean {
  const now = Date.now();
  return opensAt.getTime() <= now && now <= closesAt.getTime();
}

/** Returns true if the deadline falls within 48 hours from now. */
export function isWithin48Hours(deadline: Date): boolean {
  const now = Date.now();
  const ms = deadline.getTime() - now;
  return ms > 0 && ms <= 48 * 60 * 60 * 1000;
}

/** Formats a UTC date string as a human-readable local date. */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Formats a UTC date string as a human-readable local datetime. */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
