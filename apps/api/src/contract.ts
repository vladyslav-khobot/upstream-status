/**
 * Response shapes of this API. The web app keeps its own copy of these types
 * (apps/web/src/api/schemas.ts) because the two apps are deployed separately:
 * any change here has to stay backward compatible with the web build already in production.
 */

export type ServiceStatus =
  'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance' | 'unknown';

export type ComponentStatus =
  'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' | 'under_maintenance';

export type IncidentImpact = 'none' | 'minor' | 'major' | 'critical' | 'maintenance';

export interface ServiceSummary {
  id: string;
  name: string;
  statusPageUrl: string;
  status: ServiceStatus;
  description: string;
  activeIncidentCount: number;
  /** When the upstream status page last changed, ISO 8601. */
  updatedAt: string | null;
  /** When this API last fetched the upstream page, ISO 8601. */
  fetchedAt: string;
  /** Set when the upstream page could not be fetched; `status` is then `unknown`. */
  error: string | null;
}

export interface Component {
  id: string;
  name: string;
  description: string | null;
  status: ComponentStatus;
}

export interface IncidentUpdate {
  status: string;
  /** Plain text: upstream HTML is stripped by the API. */
  body: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  name: string;
  status: string;
  impact: IncidentImpact;
  url: string | null;
  startedAt: string;
  resolvedAt: string | null;
  latestUpdate: IncidentUpdate | null;
}

export interface ServiceDetail extends ServiceSummary {
  components: Component[];
  activeIncidents: Incident[];
  scheduledMaintenances: Incident[];
}

export interface ServiceListResponse {
  services: ServiceSummary[];
}

export interface IncidentHistoryResponse {
  incidents: Incident[];
}

export interface ErrorResponse {
  error: { message: string };
}
