import type {
  Component,
  Incident,
  IncidentUpdate,
  ServiceDetail,
  ServiceStatus,
  ServiceSummary,
} from '../contract.ts';
import { htmlToText } from '../lib/html-to-text.ts';
import type { CatalogEntry } from '../types.ts';
import type {
  StatuspageIncident,
  StatuspageIncidentUpdate,
  StatuspageIndicator,
  StatuspageSummary,
} from './types.ts';

const statusByIndicator: Record<StatuspageIndicator, ServiceStatus> = {
  none: 'operational',
  minor: 'degraded',
  major: 'partial_outage',
  critical: 'major_outage',
  maintenance: 'maintenance',
};

const toIncidentUpdate = ({
  status,
  body,
  created_at: createdAt,
}: StatuspageIncidentUpdate): IncidentUpdate => ({ status, body: htmlToText(body), createdAt });

export const toIncident = ({
  id,
  name,
  status,
  impact,
  shortlink,
  created_at: createdAt,
  started_at: startedAt,
  resolved_at: resolvedAt,
  incident_updates: updates,
}: StatuspageIncident): Incident => {
  // Updates come newest first.
  const [latest] = updates;
  return {
    id,
    name,
    status,
    impact,
    url: shortlink ?? null,
    startedAt: startedAt ?? createdAt,
    resolvedAt: resolvedAt ?? null,
    latestUpdate: latest ? toIncidentUpdate(latest) : null,
  };
};

const toComponents = (components: StatuspageSummary['components']): Component[] =>
  components
    .filter(({ group }) => !group)
    .toSorted(({ position: a = 0 }, { position: b = 0 }) => a - b)
    .map(({ id, name, description, status }) => ({
      id,
      name,
      description: description ?? null,
      status,
    }));

export const toServiceSummary = (
  { id, name, baseUrl }: CatalogEntry,
  { status, incidents, page }: StatuspageSummary,
  fetchedAt: Date,
): ServiceSummary => ({
  id,
  name,
  statusPageUrl: baseUrl,
  status: statusByIndicator[status.indicator],
  description: status.description,
  activeIncidentCount: incidents.length,
  updatedAt: page.updated_at ?? null,
  fetchedAt: fetchedAt.toISOString(),
  error: null,
});

/** Used when an upstream page is down or broken: the service still shows up, as `unknown`. */
export const toUnavailableSummary = (
  { id, name, baseUrl }: CatalogEntry,
  error: unknown,
  fetchedAt: Date,
): ServiceSummary => ({
  id,
  name,
  statusPageUrl: baseUrl,
  status: 'unknown',
  description: 'Status page is unavailable',
  activeIncidentCount: 0,
  updatedAt: null,
  fetchedAt: fetchedAt.toISOString(),
  error: error instanceof Error ? error.message : String(error),
});

export const toServiceDetail = (
  entry: CatalogEntry,
  summary: StatuspageSummary,
  fetchedAt: Date,
): ServiceDetail => {
  const { components, incidents, scheduled_maintenances: maintenances } = summary;
  return {
    ...toServiceSummary(entry, summary, fetchedAt),
    components: toComponents(components),
    activeIncidents: incidents.map(toIncident),
    scheduledMaintenances: maintenances.map(toIncident),
  };
};
