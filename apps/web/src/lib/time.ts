const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

/** "5 minutes ago", "yesterday", "just now". */
export const formatRelative = (iso: string, now: Date = new Date()): string => {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);

  for (const [unit, unitSeconds] of UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return 'just now';
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Absolute time in the viewer's locale and time zone. */
export const formatDateTime = (iso: string): string => dateTimeFormatter.format(new Date(iso));

export const formatDuration = (startIso: string, endIso: string): string => {
  const minutes = Math.max(
    0,
    Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000),
  );
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
};

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Calendar day of a timestamp, used to group incidents: "2026-11-27". */
export const toDayKey = (iso: string): string => new Date(iso).toISOString().slice(0, 10);

/** Heading for a day group in the viewer's locale: "Fri, 27 November 2026". */
export const formatDay = (dayKey: string): string => dayFormatter.format(new Date(dayKey));
