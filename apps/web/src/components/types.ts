import type { ReactNode } from 'react';

import type {
  Incident,
  IncidentUpdate,
  ServiceComponent,
  ServiceStatus,
  ServiceSummary,
} from '../api/types';

export type DashboardFilter = 'all' | 'issues';

export interface FilterTabsProps {
  value: DashboardFilter;
  issueCount: number;
  onChange: (value: DashboardFilter) => void;
}

export interface FilterOption {
  value: DashboardFilter;
  label: string;
}

export interface StatusProps {
  status: ServiceStatus;
}

export interface RelativeTimeProps {
  iso: string;
}

export interface ServiceCardProps {
  service: ServiceSummary;
}

export interface IncidentCardProps {
  incident: Incident;
}

export interface IncidentUpdateNoteProps {
  update: IncidentUpdate;
}

export interface ComponentListProps {
  components: ServiceComponent[];
}

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export interface SectionProps {
  title: string;
  children: ReactNode;
}

export interface IncidentHistoryProps {
  serviceId: string;
}

export interface SkeletonBlockProps {
  className: string;
}
