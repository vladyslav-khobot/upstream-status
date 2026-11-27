import { z } from 'zod';

/**
 * Runtime schemas for API responses. They mirror apps/api/src/contract.ts.
 * Parsing at the boundary means a contract mismatch surfaces as one clear
 * error in the query, not as `undefined` deep inside a component.
 */

export const serviceStatusSchema = z.enum([
  'operational',
  'degraded',
  'partial_outage',
  'major_outage',
  'maintenance',
  'unknown',
]);

export const componentStatusSchema = z.enum([
  'operational',
  'degraded_performance',
  'partial_outage',
  'major_outage',
  'under_maintenance',
]);

export const incidentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  impact: z.enum(['none', 'minor', 'major', 'critical', 'maintenance']),
  url: z.string().nullable(),
  startedAt: z.string(),
  resolvedAt: z.string().nullable(),
  latestUpdate: z
    .object({ status: z.string(), body: z.string(), createdAt: z.string() })
    .nullable(),
});

export const serviceSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  statusPageUrl: z.string(),
  status: serviceStatusSchema,
  description: z.string(),
  activeIncidentCount: z.number(),
  updatedAt: z.string().nullable(),
  fetchedAt: z.string(),
  error: z.string().nullable(),
});

export const serviceListSchema = z.object({
  services: z.array(serviceSummarySchema),
});

export const serviceDetailSchema = serviceSummarySchema.extend({
  components: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      status: componentStatusSchema,
    }),
  ),
  activeIncidents: z.array(incidentSchema),
  scheduledMaintenances: z.array(incidentSchema),
});

export const incidentHistorySchema = z.object({
  incidents: z.array(incidentSchema),
});
