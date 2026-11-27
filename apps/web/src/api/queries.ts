import { queryOptions } from '@tanstack/react-query';

import { getJson, isApiError } from './client';
import { incidentHistorySchema, serviceDetailSchema, serviceListSchema } from './schemas';

/** Live refresh: matches the API cache TTL, so every poll can bring new data. */
export const POLL_INTERVAL_MS = 10_000;

/** How many incidents the history shows at first and adds on "Show more". */
export const HISTORY_PAGE_SIZE = 25;

/**
 * Query keys live in one place and are built hierarchically, so
 * `invalidateQueries({ queryKey: serviceKeys.all })` refreshes everything at once.
 */
export const serviceKeys = {
  all: ['services'] as const,
  list: () => [...serviceKeys.all, 'list'] as const,
  detail: (id: string) => [...serviceKeys.all, 'detail', id] as const,
  incidents: (id: string, limit: number) =>
    [...serviceKeys.all, 'detail', id, 'incidents', { limit }] as const,
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

const incidentHistoryPath = (serviceId: string, limit: number) =>
  `/api/services/${encodeURIComponent(serviceId)}/incidents?limit=${limit}`;

export const incidentHistoryQueryOptions = (serviceId: string, limit = HISTORY_PAGE_SIZE) =>
  queryOptions({
    queryKey: serviceKeys.incidents(serviceId, limit),
    queryFn: ({ signal }) =>
      getJson(incidentHistoryPath(serviceId, limit), incidentHistorySchema, signal),
    // Providers do not always return incidents in order; newest first.
    select: ({ incidents }) =>
      incidents.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt)),
    // History changes rarely; no need to poll it.
    staleTime: 5 * 60_000,
  });

/** Retrying a 404 will not make the service exist. */
export const shouldRetry = (failureCount: number, error: Error): boolean => {
  if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
  return failureCount < 2;
};
