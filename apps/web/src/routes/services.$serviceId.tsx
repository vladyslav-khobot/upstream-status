import { noop, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';

import { isApiError } from '../api/client';
import { incidentHistoryQueryOptions, serviceDetailQueryOptions } from '../api/queries';
import { ComponentList } from '../components/ComponentList';
import { IncidentCard } from '../components/IncidentCard';
import { IncidentHistory } from '../components/IncidentHistory';
import { RelativeTime } from '../components/RelativeTime';
import { Section } from '../components/Section';
import { DetailSkeleton } from '../components/Skeletons';
import { StatusBadge } from '../components/StatusBadge';

const ServicePage = () => {
  const { serviceId } = Route.useParams();
  const {
    data: {
      name,
      status,
      description,
      updatedAt,
      statusPageUrl,
      activeIncidents,
      scheduledMaintenances,
      components,
    },
  } = useSuspenseQuery(serviceDetailQueryOptions(serviceId));

  return (
    <div className="space-y-8">
      <div>
        <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← All services
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <StatusBadge status={status} />
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {description}
          {updatedAt && (
            <>
              {' · '}page updated <RelativeTime iso={updatedAt} />
            </>
          )}
          {' · '}
          <a
            href={statusPageUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-zinc-900"
          >
            Official status page
          </a>
        </p>
      </div>

      {activeIncidents.length > 0 && (
        <Section title="Active incidents">
          {activeIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </Section>
      )}

      {scheduledMaintenances.length > 0 && (
        <Section title="Scheduled maintenance">
          {scheduledMaintenances.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </Section>
      )}

      {components.length > 0 && (
        <Section title="Components">
          <ComponentList components={components} />
        </Section>
      )}

      <Section title="Recent incidents">
        <IncidentHistory serviceId={serviceId} />
      </Section>
    </div>
  );
};

export const Route = createFileRoute('/services/$serviceId')({
  loader: async ({ context: { queryClient }, params: { serviceId } }) => {
    // Start the history request without waiting for it: the page can render before it arrives.
    // Errors are ignored here; the history section shows its own error state.
    queryClient.query(incidentHistoryQueryOptions(serviceId)).catch(noop);
    try {
      await queryClient.query({
        ...serviceDetailQueryOptions(serviceId),
        staleTime: 'static',
      });
    } catch (error) {
      // An unknown service id is a missing page, not a failure.
      if (isApiError(error) && error.status === 404) throw notFound();
      throw error;
    }
  },
  pendingComponent: DetailSkeleton,
  component: ServicePage,
});
