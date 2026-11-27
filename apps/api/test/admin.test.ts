import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';

import { createApp } from '../src/app.ts';
import type { StatuspageClient } from '../src/statuspage/types.ts';

const summary = {
  page: { name: 'Acme', url: 'https://status.acme.test', updated_at: null },
  status: { indicator: 'none' as const, description: 'All Systems Operational' },
  components: [],
  incidents: [],
  scheduled_maintenances: [],
};

let cacheCleared = 0;
const client: StatuspageClient = {
  getSummary: () => Promise.resolve(summary),
  getIncidents: () => Promise.resolve([]),
  clearCache: () => {
    cacheCleared += 1;
  },
};

const app = createApp({ config: { CORS_ORIGIN: '*', ADMIN_TOKEN: 'secret' }, client });
let baseUrl = '';
let server: ReturnType<typeof app.listen>;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

describe('POST /api/admin/cache/refresh', () => {
  it('rejects requests without the admin token', async () => {
    const response = await fetch(`${baseUrl}/api/admin/cache/refresh`, { method: 'POST' });
    assert.equal(response.status, 401);
    assert.equal(cacheCleared, 0);
  });

  it('clears the cache and refetches every service', async () => {
    const response = await fetch(`${baseUrl}/api/admin/cache/refresh`, {
      method: 'POST',
      headers: { 'x-admin-token': 'secret' },
    });
    const body = (await response.json()) as { refreshed: number };

    assert.equal(response.status, 200);
    assert.equal(cacheCleared, 1);
    assert.ok(body.refreshed > 0);
  });
});
