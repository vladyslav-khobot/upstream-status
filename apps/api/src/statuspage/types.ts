import type { z } from 'zod';

import type { CatalogEntry } from '../types.ts';
import type { componentSchema, incidentSchema, summarySchema } from './schema.ts';

export type StatuspageSummary = z.infer<typeof summarySchema>;
export type StatuspageIncident = z.infer<typeof incidentSchema>;
export type StatuspageIncidentUpdate = StatuspageIncident['incident_updates'][number];
export type StatuspageComponent = z.infer<typeof componentSchema>;
export type StatuspageIndicator = StatuspageSummary['status']['indicator'];

export interface StatuspageClientOptions {
  cacheTtlMs: number;
  timeoutMs: number;
  fetch?: typeof fetch;
}

export interface StatuspageClient {
  getSummary: (entry: CatalogEntry) => Promise<StatuspageSummary>;
  getIncidents: (entry: CatalogEntry) => Promise<StatuspageIncident[]>;
  clearCache: () => void;
}

/** A status page could not be fetched or returned something unexpected. */
export type UpstreamError = Error & { name: 'UpstreamError' };
