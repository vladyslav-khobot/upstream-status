import type { ComponentStatus, ServiceStatus, ServiceSummary } from '../api/types';
import type { StatusMeta } from './types';

export const serviceStatusMeta: Record<ServiceStatus, StatusMeta> = {
  operational: {
    label: 'Operational',
    severity: 0,
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
  },
  maintenance: {
    label: 'Maintenance',
    severity: 1,
    dotClass: 'bg-sky-500',
    badgeClass: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  },
  degraded: {
    label: 'Degraded',
    severity: 2,
    dotClass: 'bg-amber-400',
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  },
  unknown: {
    label: 'Unknown',
    severity: 3,
    dotClass: 'bg-zinc-400',
    badgeClass: 'bg-zinc-100 text-zinc-700 ring-zinc-500/20',
  },
  partial_outage: {
    label: 'Partial outage',
    severity: 4,
    dotClass: 'bg-orange-500',
    badgeClass: 'bg-orange-50 text-orange-800 ring-orange-600/20',
  },
  major_outage: {
    label: 'Major outage',
    severity: 5,
    dotClass: 'bg-red-600',
    badgeClass: 'bg-red-50 text-red-800 ring-red-600/20',
  },
};

/** Components use Statuspage's own vocabulary; map it onto the service-level look. */
export const componentStatusToServiceStatus: Record<ComponentStatus, ServiceStatus> = {
  operational: 'operational',
  degraded_performance: 'degraded',
  partial_outage: 'partial_outage',
  major_outage: 'major_outage',
  under_maintenance: 'maintenance',
};

export const hasIssues = ({ status }: Pick<ServiceSummary, 'status'>): boolean =>
  status !== 'operational';

/** Worst status first, then alphabetical, so problems are always at the top. */
export const sortBySeverity = <T extends Pick<ServiceSummary, 'status' | 'name'>>(
  services: readonly T[],
): T[] =>
  services.toSorted(
    (a, b) =>
      serviceStatusMeta[b.status].severity - serviceStatusMeta[a.status].severity ||
      a.name.localeCompare(b.name),
  );
