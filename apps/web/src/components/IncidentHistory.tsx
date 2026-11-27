import { useQuery } from '@tanstack/react-query';

import { incidentHistoryQueryOptions } from '../api/queries';
import { ErrorState } from './ErrorState';
import { IncidentCard } from './IncidentCard';
import { IncidentListSkeleton } from './Skeletons';
import type { IncidentHistoryProps } from './types';

/** Uses a regular (non-suspense) query so a slow history request never blocks the page above it. */
export const IncidentHistory = ({ serviceId }: IncidentHistoryProps) => {
  const {
    data: incidents,
    error,
    isPending,
    refetch,
  } = useQuery(incidentHistoryQueryOptions(serviceId));

  if (isPending) return <IncidentListSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (incidents.length === 0) {
    return <p className="text-sm text-zinc-500">No incidents reported recently.</p>;
  }

  return incidents.map((incident) => <IncidentCard key={incident.id} incident={incident} />);
};
