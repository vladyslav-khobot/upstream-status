import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { htmlToText } from '../src/lib/html-to-text.ts';
import { toIncident, toServiceDetail } from '../src/statuspage/normalize.ts';
import { summarySchema } from '../src/statuspage/schema.ts';
import type { CatalogEntry } from '../src/types.ts';

const entry: CatalogEntry = { id: 'acme', name: 'Acme', baseUrl: 'https://status.acme.test' };
const fetchedAt = new Date('2026-01-01T00:00:00Z');

describe('toServiceDetail', () => {
  it('maps the page indicator and skips component groups', () => {
    const summary = summarySchema.parse({
      page: { name: 'Acme', url: entry.baseUrl, updated_at: '2026-01-01T00:00:00Z' },
      status: { indicator: 'major', description: 'Partial System Outage' },
      components: [
        { id: 'g', name: 'Group', status: 'operational', group: true, position: 0 },
        { id: 'b', name: 'API', status: 'partial_outage', position: 2 },
        { id: 'a', name: 'Web', status: 'operational', position: 1 },
      ],
    });

    const detail = toServiceDetail(entry, summary, fetchedAt);

    assert.equal(detail.status, 'partial_outage');
    assert.deepEqual(
      detail.components.map(({ id }) => id),
      ['a', 'b'],
    );
    // Missing incident lists (incident.io-hosted pages) default to empty.
    assert.deepEqual(detail.activeIncidents, []);
  });
});

describe('toIncident', () => {
  it('falls back to created_at and keeps only the latest update as text', () => {
    const incident = toIncident({
      id: 'i1',
      name: 'Slow builds',
      status: 'resolved',
      impact: 'minor',
      created_at: '2026-01-01T10:00:00Z',
      incident_updates: [
        {
          status: 'resolved',
          body: 'Fixed.<br />Thanks &amp; sorry',
          created_at: '2026-01-01T12:00:00Z',
        },
        { status: 'investigating', body: 'Looking', created_at: '2026-01-01T10:00:00Z' },
      ],
    });

    assert.equal(incident.startedAt, '2026-01-01T10:00:00Z');
    assert.equal(incident.resolvedAt, null);
    assert.equal(incident.latestUpdate?.body, 'Fixed.\nThanks & sorry');
  });
});

describe('htmlToText', () => {
  it('strips tags, including script tags', () => {
    assert.equal(htmlToText('<a href="x">link</a><script>alert(1)</script>'), 'linkalert(1)');
  });

  it('handles numeric and double-escaped entities', () => {
    assert.equal(
      htmlToText('&#60;p&#62;Planned work&#60;/p&#62; &#x2014; 2&nbsp;h'),
      'Planned work — 2 h',
    );
  });
});
