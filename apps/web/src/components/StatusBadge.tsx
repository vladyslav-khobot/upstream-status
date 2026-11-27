import { serviceStatusMeta } from '../lib/status';
import type { StatusProps } from './types';

export const StatusDot = ({ status }: StatusProps) => (
  <span
    aria-hidden="true"
    className={`inline-block size-2.5 shrink-0 rounded-full ${serviceStatusMeta[status].dotClass}`}
  />
);

/** Color is never the only signal: the badge always carries a text label. */
export const StatusBadge = ({ status }: StatusProps) => {
  const { label, badgeClass } = serviceStatusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeClass}`}
    >
      <StatusDot status={status} />
      {label}
    </span>
  );
};
