import { useEffect, useState } from 'react';

import { formatDateTime, formatRelative } from '../lib/time';
import type { RelativeTimeProps } from './types';

const TICK_MS = 30_000;

/** Re-renders itself so "2 minutes ago" keeps counting without a refetch. */
export const RelativeTime = ({ iso }: RelativeTimeProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, TICK_MS);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <time dateTime={iso} title={formatDateTime(iso)}>
      {formatRelative(iso, now)}
    </time>
  );
};
