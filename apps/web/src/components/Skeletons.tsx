import type { SkeletonBlockProps } from './types';

const Block = ({ className }: SkeletonBlockProps) => (
  <div className={`animate-pulse rounded bg-zinc-200 ${className}`} />
);

export const ServiceGridSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading services">
    <Block className="h-8 w-72" />
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }, (_, i) => (
        <li key={i}>
          <Block className="h-28" />
        </li>
      ))}
    </ul>
  </div>
);

export const IncidentListSkeleton = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading incidents">
    {Array.from({ length: 3 }, (_, i) => (
      <Block key={i} className="h-24" />
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="space-y-8" aria-busy="true" aria-label="Loading service">
    <Block className="h-8 w-56" />
    <Block className="h-64" />
    <IncidentListSkeleton />
  </div>
);
