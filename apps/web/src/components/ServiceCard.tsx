import { Link } from '@tanstack/react-router';

import { RelativeTime } from './RelativeTime';
import { StatusBadge } from './StatusBadge';
import type { ServiceCardProps } from './types';

export const ServiceCard = ({
  service: { id, name, status, description, error, activeIncidentCount, updatedAt },
}: ServiceCardProps) => (
  <Link
    to="/services/$serviceId"
    params={{ serviceId: id }}
    className="block h-full rounded-lg border border-zinc-200 bg-white p-4 shadow-xs transition hover:border-zinc-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-zinc-900"
  >
    <div className="flex items-start justify-between gap-3">
      <h2 className="font-medium">{name}</h2>
      <StatusBadge status={status} />
    </div>

    <p className="mt-2 line-clamp-2 text-sm text-zinc-600" title={error ?? undefined}>
      {description}
    </p>

    <p className="mt-3 text-xs text-zinc-500">
      {activeIncidentCount > 0 &&
        `${activeIncidentCount} active incident${activeIncidentCount === 1 ? '' : 's'} · `}
      {updatedAt ? (
        <>
          Updated <RelativeTime iso={updatedAt} />
        </>
      ) : (
        'No update time'
      )}
    </p>
  </Link>
);
