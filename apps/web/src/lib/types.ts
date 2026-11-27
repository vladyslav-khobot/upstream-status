import type { Incident } from '../api/types';

export interface StatusMeta {
  label: string;
  /** Higher means worse; used to sort the dashboard. */
  severity: number;
  dotClass: string;
  badgeClass: string;
}

export interface IncidentDayGroup {
  /** "2026-11-27" */
  day: string;
  incidents: Incident[];
}
