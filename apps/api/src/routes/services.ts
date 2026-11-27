import { Router } from 'express';

import { findCatalogEntry } from '../catalog.ts';
import type { IncidentHistoryResponse, ServiceDetail, ServiceListResponse } from '../contract.ts';
import { createHttpError } from '../lib/http-error.ts';
import { toIncident, toServiceDetail } from '../statuspage/normalize.ts';
import { getAllSummaries } from '../statuspage/summaries.ts';
import type { StatuspageClient } from '../statuspage/types.ts';

const DEFAULT_HISTORY_LIMIT = 25;

const getCatalogEntry = (serviceId: string) => {
  const entry = findCatalogEntry(serviceId);
  if (!entry) throw createHttpError(404, `Unknown service "${serviceId}"`);
  return entry;
};

export const servicesRouter = (client: StatuspageClient): Router => {
  const router = Router();

  router.get('/', async (_req, res) => {
    const services = await getAllSummaries(client);
    res.json({ services } satisfies ServiceListResponse);
  });

  router.get('/:serviceId', async ({ params: { serviceId } }, res) => {
    const entry = getCatalogEntry(serviceId);
    const summary = await client.getSummary(entry);
    res.json(toServiceDetail(entry, summary, new Date()) satisfies ServiceDetail);
  });

  // ?limit=N controls how many incidents are returned ("Show more" in the UI).
  router.get('/:serviceId/incidents', async ({ params: { serviceId }, query }, res) => {
    const entry = getCatalogEntry(serviceId);
    const limit = Number(query.limit ?? DEFAULT_HISTORY_LIMIT);
    const incidents = await client.getIncidents(entry);
    res.json({
      incidents: incidents.slice(0, limit).map(toIncident),
    } satisfies IncidentHistoryResponse);
  });

  return router;
};
