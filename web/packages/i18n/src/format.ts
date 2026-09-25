const dateTimeOptions: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

// Instants arrive as ISO-8601 UTC strings; the profile zone decides what the user sees.
export function formatDateTime(instant: string, timeZone: string, language: string): string {
  const date = new Date(instant);
  try {
    return new Intl.DateTimeFormat(language, { ...dateTimeOptions, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat(language, { ...dateTimeOptions, timeZone: 'UTC' }).format(date);
  }
}

// Current wall-clock time in another person's zone, e.g. a client far from the consultant.
export function formatLocalTime(now: Date, timeZone: string, language: string): string {
  try {
    return new Intl.DateTimeFormat(language, { timeStyle: 'short', timeZone }).format(now);
  } catch {
    return new Intl.DateTimeFormat(language, { timeStyle: 'short', timeZone: 'UTC' }).format(now);
  }
}

// Some sandboxed browsers report Etc/Unknown, which the API rejects; UTC keeps sign-in possible.
export function detectTimeZone(): string {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return zone && zone !== 'Etc/Unknown' ? zone : 'UTC';
}
