import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { z } from 'zod';

import { serviceKeys, serviceListQueryOptions } from '../api/queries';
import type { ServiceSummary } from '../api/types';
import { FilterTabs } from '../components/FilterTabs';
import { RelativeTime } from '../components/RelativeTime';
import { ServiceCard } from '../components/ServiceCard';
import { ServiceGridSkeleton } from '../components/Skeletons';
import type { DashboardFilter } from '../components/types';
import { hasIssues, sortBySeverity } from '../lib/status';

// Filters live in the URL, so a filtered view can be bookmarked or shared.
const defaultSearch = { filter: 'all', q: '' } as const;

const searchSchema = z.object({
  filter: z
    .enum(['all', 'issues'] satisfies DashboardFilter[])
    .default(defaultSearch.filter)
    .catch(defaultSearch.filter),
  q: z.string().default(defaultSearch.q).catch(defaultSearch.q),
});

const filterServices = (
  services: ServiceSummary[],
  filter: DashboardFilter,
  query: string,
): ServiceSummary[] => {
  const needle = query.trim().toLowerCase();
  return sortBySeverity(
    services.filter(
      ({ name, status }) =>
        (filter === 'all' || hasIssues({ status })) &&
        (needle === '' || name.toLowerCase().includes(needle)),
    ),
  );
};

const Dashboard = () => {
  const { filter, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const { data: services, dataUpdatedAt, isFetching } = useSuspenseQuery(serviceListQueryOptions());

  const visible = useMemo(() => filterServices(services, filter, q), [services, filter, q]);
  const issueCount = services.filter(hasIssues).length;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {issueCount === 0
              ? 'All services operational'
              : `${issueCount} of ${services.length} services have issues`}
          </h1>
          <p className="mt-1 text-sm text-zinc-500" aria-live="polite">
            {isFetching ? (
              'Refreshing…'
            ) : (
              <>
                Updated <RelativeTime iso={new Date(dataUpdatedAt).toISOString()} />, refreshes
                every minute
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void queryClient.invalidateQueries({ queryKey: serviceKeys.all })}
          disabled={isFetching}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-zinc-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <FilterTabs
          value={filter}
          issueCount={issueCount}
          onChange={(next) => void navigate({ search: (prev) => ({ ...prev, filter: next }) })}
        />
        <label className="relative ml-auto w-full sm:w-64">
          <span className="sr-only">Search services</span>
          <input
            type="search"
            value={q}
            placeholder="Search services…"
            onChange={({ target: { value } }) =>
              void navigate({
                search: (prev) => ({ ...prev, q: value }),
                // Typing should not create a history entry per keystroke.
                replace: true,
              })
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-xs placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
          />
        </label>
      </section>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          {filter === 'issues' && !q ? 'No services have issues right now.' : 'No services match.'}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service) => (
            <li key={service.id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  // Keep the URL clean: default values are not written into it.
  search: { middlewares: [stripSearchParams(defaultSearch)] },
  // 'static' = use cached data if there is any and let the component refetch in the background.
  loader: ({ context: { queryClient } }) =>
    queryClient.query({ ...serviceListQueryOptions(), staleTime: 'static' }),
  pendingComponent: ServiceGridSkeleton,
  component: Dashboard,
});
