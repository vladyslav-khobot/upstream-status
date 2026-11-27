import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { HISTORY_PAGE_SIZE, incidentHistoryQueryOptions } from '../api/queries';
import { groupIncidentsByDay } from '../lib/group-incidents';
import { formatDay } from '../lib/time';
import { ErrorState } from './ErrorState';
import { IncidentCard } from './IncidentCard';
import { IncidentListSkeleton } from './Skeletons';
import type { IncidentHistoryProps } from './types';

/** Uses a regular (non-suspense) query so a slow history request never blocks the page above it. */
export const IncidentHistory = ({ serviceId }: IncidentHistoryProps) => {
  const [limit, setLimit] = useState(HISTORY_PAGE_SIZE);
  const {
    data: incidents,
    error,
    isPending,
    isFetching,
    refetch,
  } = useQuery({
    ...incidentHistoryQueryOptions(serviceId, limit),
    // Keep the current list on screen while "Show more" loads the longer one.
    placeholderData: keepPreviousData,
  });

  const groups = useMemo(() => groupIncidentsByDay(incidents ?? []), [incidents]);

  if (isPending) return <IncidentListSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;
  if (incidents.length === 0) {
    return <p className="text-sm text-zinc-500">No incidents reported recently.</p>;
  }

  // Fewer results than asked for means there is nothing more to load.
  const hasMore = incidents.length >= limit;

  return (
    <div className="space-y-6">
      {groups.map(({ day, incidents: dayIncidents }) => (
        <div key={day} className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-500">{formatDay(day)}</h3>
          {dayIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          disabled={isFetching}
          onClick={() => {
            setLimit((current) => current + HISTORY_PAGE_SIZE);
          }}
          className="w-full rounded-md border border-zinc-300 bg-white py-2 text-sm font-medium shadow-xs hover:bg-zinc-50 disabled:opacity-50"
        >
          {isFetching ? 'Loading…' : 'Show more'}
        </button>
      )}
    </div>
  );
};
