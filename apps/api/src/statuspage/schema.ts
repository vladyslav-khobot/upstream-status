import { z } from 'zod';

/**
 * Schemas for the public Statuspage v2 API (https://<page>/api/v2/*.json).
 *
 * Pages hosted on incident.io mimic this API but omit some fields
 * (no `incidents` in summary.json, no `started_at`), so those are optional.
 * Unknown fields are stripped by zod.
 */

const indicatorSchema = z.enum(['none', 'minor', 'major', 'critical', 'maintenance']);

export const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  status: z.enum([
    'operational',
    'degraded_performance',
    'partial_outage',
    'major_outage',
    'under_maintenance',
  ]),
  /** Group rows are containers for other components, not components themselves. */
  group: z.boolean().optional(),
  position: z.number().optional(),
});

const incidentUpdateSchema = z.object({
  status: z.string(),
  body: z.string(),
  created_at: z.string(),
});

export const incidentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  impact: indicatorSchema,
  shortlink: z.string().nullish(),
  created_at: z.string(),
  started_at: z.string().nullish(),
  resolved_at: z.string().nullish(),
  incident_updates: z.array(incidentUpdateSchema).default([]),
});

const pageSchema = z.object({
  name: z.string(),
  url: z.string(),
  updated_at: z.string().nullish(),
});

export const summarySchema = z.object({
  page: pageSchema,
  status: z.object({ indicator: indicatorSchema, description: z.string() }),
  components: z.array(componentSchema).default([]),
  incidents: z.array(incidentSchema).default([]),
  scheduled_maintenances: z.array(incidentSchema).default([]),
});

export const incidentsSchema = z.object({
  incidents: z.array(incidentSchema),
});
