import type { z } from 'zod';

import type {
  componentStatusSchema,
  incidentSchema,
  serviceDetailSchema,
  serviceStatusSchema,
  serviceSummarySchema,
} from './schemas';

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type ComponentStatus = z.infer<typeof componentStatusSchema>;
export type ServiceSummary = z.infer<typeof serviceSummarySchema>;
export type ServiceDetail = z.infer<typeof serviceDetailSchema>;
export type ServiceComponent = ServiceDetail['components'][number];
export type Incident = z.infer<typeof incidentSchema>;
export type IncidentUpdate = NonNullable<Incident['latestUpdate']>;

/** A failed API request; `status` is the HTTP status code. */
export type ApiError = Error & { name: 'ApiError'; status: number };
