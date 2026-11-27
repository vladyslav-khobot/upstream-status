import { describe, expect, it } from 'vitest';

import { formatDuration, formatRelative } from './time';

const now = new Date('2026-01-10T12:00:00Z');

describe('formatRelative', () => {
  it.each([
    ['2026-01-10T11:59:30Z', 'just now'],
    ['2026-01-10T11:55:00Z', '5 minutes ago'],
    ['2026-01-10T09:00:00Z', '3 hours ago'],
    ['2026-01-09T12:00:00Z', 'yesterday'],
  ])('formats %s as "%s"', (iso, expected) => {
    expect(formatRelative(iso, now)).toBe(expected);
  });
});

describe('formatDuration', () => {
  it('formats minutes and hours', () => {
    expect(formatDuration('2026-01-10T10:00:00Z', '2026-01-10T10:45:00Z')).toBe('45 min');
    expect(formatDuration('2026-01-10T10:00:00Z', '2026-01-10T12:00:00Z')).toBe('2 h');
    expect(formatDuration('2026-01-10T10:00:00Z', '2026-01-10T12:30:00Z')).toBe('2 h 30 min');
  });
});
