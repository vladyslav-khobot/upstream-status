import { useEffect, useState } from 'react';

import { onTick } from '../lib/ticker';
import { formatDateTime, formatRelative } from '../lib/time';
import type { RelativeTimeProps } from './types';

/** Re-renders itself so "2 minutes ago" keeps counting without a refetch. */
export const RelativeTime = ({ iso }: RelativeTimeProps) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    onTick(() => {
      setNow(new Date());
    });
  }, []);

  return (
    <time dateTime={iso} title={formatDateTime(iso)}>
      {formatRelative(iso, now)}
    </time>
  );
};
