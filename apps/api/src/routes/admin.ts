import { Router } from 'express';

import type { CacheRefreshResponse } from '../contract.ts';
import { createHttpError } from '../lib/http-error.ts';
import { getAllSummaries } from '../statuspage/summaries.ts';
import type { StatuspageClient } from '../statuspage/types.ts';

export const adminRouter = (client: StatuspageClient, adminToken: string): Router => {
  const router = Router();

  router.use((req, _res, next) => {
    if (req.get('x-admin-token') !== adminToken) {
      throw createHttpError(401, 'Invalid admin token');
    }
    next();
  });

  // Drops cached status pages and fetches them again, so "Refresh" in the UI shows fresh data.
  router.post('/cache/refresh', async (_req, res) => {
    client.clearCache();
    const services = await getAllSummaries(client);
    res.json({ refreshed: services.length } satisfies CacheRefreshResponse);
  });

  return router;
};
