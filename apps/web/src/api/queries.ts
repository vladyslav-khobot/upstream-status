import { queryOptions } from '@tanstack/react-query';

import { getJson, isApiError } from './client';
import { incidentHistorySchema, serviceDetailSchema, serviceListSchema } from './schemas';

/** The API caches status pages for 60s, so polling faster would only return the same data. */
export const POLL_INTERVAL_MS = 60_000;

/**
 * Query keys live in one place and are built hierarchically, so
 * `invalidateQueries({ queryKey: serviceKeys.all })` refreshes everything at once.
 */
export const serviceKeys = {
  all: ['services'] as const,
  list: () => [...serviceKeys.all, 'list'] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
  incidents: (id: string) => [...serviceKeys.all, 'detail', id, 'incidents'] as const,
};

export const serviceListQueryOptions = () =>
  queryOptions({
    queryKey: serviceKeys.list(),
    queryFn: ({ signal }) => getJson('/api/services', serviceListSchema, signal),
    select: ({ services }) => services,
    refetchInterval: POLL_INTERVAL_MS,
  });

export const serviceDetailQueryOptions = (serviceId: string) =>
  queryOptions({
    queryKey: serviceKeys.detail(serviceId),
    queryFn: ({ signal }) =>
      getJson(`/api/services/${encodeURIComponent(serviceId)}`, serviceDetailSchema, signal),
    refetchInterval: POLL_INTERVAL_MS,
  });

export const incidentHistoryQueryOptions = (serviceId: string) =>
  queryOptions({
    queryKey: serviceKeys.incidents(serviceId),
    queryFn: ({ signal }) =>
      getJson(
        `/api/services/${encodeURIComponent(serviceId)}/incidents`,
        incidentHistorySchema,
        signal,
      ),
    select: ({ incidents }) => incidents,
    // History changes rarely; no need to poll it.
    staleTime: 5 * 60_000,
  });

/** Retrying a 404 will not make the service exist. */
export const shouldRetry = (failureCount: number, error: Error): boolean => {
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
};
