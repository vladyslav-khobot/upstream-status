import { catalog } from '../catalog.ts';
import type { ServiceSummary } from '../contract.ts';
import { toServiceSummary } from './normalize.ts';
import type { StatuspageClient } from './types.ts';

/** Summaries of every tracked service, in catalog order. */
export const getAllSummaries = (client: StatuspageClient): Promise<ServiceSummary[]> => {
  const fetchedAt = new Date();
  return Promise.all(
    catalog.map(async (entry) =>
      toServiceSummary(entry, await client.getSummary(entry), fetchedAt),
    ),
  );
};
