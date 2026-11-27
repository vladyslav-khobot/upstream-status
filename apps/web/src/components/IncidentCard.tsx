import type { Incident } from '../api/types';
import { formatDateTime, formatDuration } from '../lib/time';
import { RelativeTime } from './RelativeTime';
import type { IncidentCardProps, IncidentUpdateNoteProps } from './types';

const impactClass: Record<Incident['impact'], string> = {
  none: 'border-l-zinc-300',
  maintenance: 'border-l-sky-500',
  minor: 'border-l-amber-400',
  major: 'border-l-orange-500',
  critical: 'border-l-red-600',
};

const IncidentUpdateNote = ({ update: { bodyHtml, createdAt } }: IncidentUpdateNoteProps) => (
  <div className="mt-3 text-sm text-zinc-700">
    {/* Rendered as HTML to keep the provider's links and line breaks. */}
    <div
      className="line-clamp-6 [&_a]:underline [&_a]:underline-offset-2"
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
    <p className="mt-1 text-xs text-zinc-500">
      Latest update <RelativeTime iso={createdAt} />
    </p>
  </div>
);

export const IncidentCard = ({
  incident: { name, status, impact, url, startedAt, resolvedAt, latestUpdate },
}: IncidentCardProps) => (
  <article
    className={`rounded-lg border border-l-4 border-zinc-200 bg-white p-4 ${impactClass[impact]}`}
  >
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="font-medium">
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="hover:underline">
            {name}
          </a>
        ) : (
          name
        )}
      </h3>
      <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{status}</span>
    </div>

    <p className="mt-1 text-xs text-zinc-500">
      Started {formatDateTime(startedAt)}
      {resolvedAt && ` · resolved after ${formatDuration(startedAt, resolvedAt)}`}
    </p>

    {latestUpdate && <IncidentUpdateNote update={latestUpdate} />}
  </article>
);
