import { componentStatusToServiceStatus, serviceStatusMeta } from '../lib/status';
import { StatusDot } from './StatusBadge';
import type { ComponentListProps } from './types';

export const ComponentList = ({ components }: ComponentListProps) => (
  <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white">
    {components.map(({ id, name, description, status: componentStatus }) => {
      const status = componentStatusToServiceStatus[componentStatus];
      return (
        <li key={id} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            {description && <p className="truncate text-xs text-zinc-500">{description}</p>}
          </div>
          <span className="flex shrink-0 items-center gap-2 text-xs text-zinc-600">
            <StatusDot status={status} />
            {serviceStatusMeta[status].label}
          </span>
        </li>
      );
    })}
  </ul>
);
