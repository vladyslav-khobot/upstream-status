import { Router } from 'express';

import { catalog, findCatalogEntry } from '../catalog.ts';
import type { IncidentHistoryResponse, ServiceDetail, ServiceListResponse } from '../contract.ts';
import { createHttpError } from '../lib/http-error.ts';
import {
  toIncident,
  toServiceDetail,
  toServiceSummary,
  toUnavailableSummary,
} from '../statuspage/normalize.ts';
import type { StatuspageClient } from '../statuspage/types.ts';

const INCIDENT_HISTORY_LIMIT = 25;

const getCatalogEntry = (serviceId: string) => {
  const entry = findCatalogEntry(serviceId);
  if (!entry) throw createHttpError(404, `Unknown service "${serviceId}"`);
  return entry;
};

export const servicesRouter = (client: StatuspageClient): Router => {
  const router = Router();

  router.get('/', async (_req, res) => {
    const fetchedAt = new Date();
    // allSettled: one broken status page must not take the whole dashboard down.
    const results = await Promise.allSettled(catalog.map((entry) => client.getSummary(entry)));

    const services = catalog.map((entry, index) => {
      const result = results[index];
      return result?.status === 'fulfilled'
        ? toServiceSummary(entry, result.value, fetchedAt)
        : toUnavailableSummary(entry, result?.reason, fetchedAt);
    });

    res.json({ services } satisfies ServiceListResponse);
  });

  router.get('/:serviceId', async ({ params: { serviceId } }, res) => {
    const entry = getCatalogEntry(serviceId);
    const summary = await client.getSummary(entry);
    res.json(toServiceDetail(entry, summary, new Date()) satisfies ServiceDetail);
  });

  router.get('/:serviceId/incidents', async ({ params: { serviceId } }, res) => {
    const entry = getCatalogEntry(serviceId);
    const incidents = await client.getIncidents(entry);
    res.json({
      incidents: incidents.slice(0, INCIDENT_HISTORY_LIMIT).map(toIncident),
    } satisfies IncidentHistoryResponse);
  });

  return router;
};
