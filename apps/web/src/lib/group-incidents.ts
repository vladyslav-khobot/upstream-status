import type { Incident } from '../api/types';
import { toDayKey } from './time';
import type { IncidentDayGroup } from './types';

/** Splits incidents (already newest first) into one group per calendar day. */
export const groupIncidentsByDay = (incidents: Incident[]): IncidentDayGroup[] => {
  const groups = new Map<string, Incident[]>();
  incidents.forEach((incident) => {
    const day = toDayKey(incident.startedAt);
    groups.set(day, [...(groups.get(day) ?? []), incident]);
  });
  return [...groups].map(([day, dayIncidents]) => ({ day, incidents: dayIncidents }));
};
