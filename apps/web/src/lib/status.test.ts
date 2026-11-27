import { describe, expect, it } from 'vitest';

import { hasIssues, sortBySeverity } from './status';

describe('sortBySeverity', () => {
  it('puts the worst status first and sorts ties by name', () => {
    const sorted = sortBySeverity([
      { name: 'b', status: 'operational' },
      { name: 'c', status: 'major_outage' },
      { name: 'a', status: 'operational' },
      { name: 'd', status: 'degraded' },
    ] as const);

    expect(sorted.map(({ name }) => name)).toEqual(['c', 'd', 'a', 'b']);
  });
});

describe('hasIssues', () => {
  it('treats anything but operational as an issue', () => {
    expect(hasIssues({ status: 'operational' })).toBe(false);
    expect(hasIssues({ status: 'maintenance' })).toBe(true);
    expect(hasIssues({ status: 'unknown' })).toBe(true);
  });
});
