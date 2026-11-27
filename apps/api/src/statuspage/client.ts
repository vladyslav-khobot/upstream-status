import type { z } from 'zod';

import { createTtlCache } from '../lib/ttl-cache.ts';
import { incidentsSchema, summarySchema } from './schema.ts';
import type { StatuspageClient, StatuspageClientOptions } from './types.ts';
import { createUpstreamError } from './upstream-error.ts';

/** Fetches status pages with a timeout, validates the payload and caches the result. */
export const createStatuspageClient = ({
  cacheTtlMs,
  timeoutMs,
  fetch: fetchImpl = fetch,
}: StatuspageClientOptions): StatuspageClient => {
  const cache = createTtlCache<unknown>(cacheTtlMs);

  const getJson = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
    let response: Response;
    try {
      response = await fetchImpl(url, {
        headers: { accept: 'application/json', 'user-agent': 'upstream-status' },
        // Without a timeout one slow status page would hold every /api/services request hostage.
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const reason =
        error instanceof Error && error.name === 'TimeoutError'
          ? `timed out after ${timeoutMs} ms`
          : 'network error';
      throw createUpstreamError(`${url}: ${reason}`, error);
    }

    if (!response.ok) {
      throw createUpstreamError(`${url}: HTTP ${response.status}`);
    }

    const parsed = schema.safeParse(await response.json());
    if (!parsed.success) {
      throw createUpstreamError(`${url}: unexpected response shape`, parsed.error);
    }
    return parsed.data;
  };

  // The cache is untyped internally; each URL is always loaded with the same schema.
  const cached = <T>(url: string, schema: z.ZodType<T>): Promise<T> =>
    cache.getOrLoad(url, () => getJson(url, schema)) as Promise<T>;

  return {
    getSummary: ({ baseUrl }) => cached(`${baseUrl}/api/v2/summary.json`, summarySchema),

    getIncidents: async ({ baseUrl }) => {
      const { incidents } = await cached(`${baseUrl}/api/v2/incidents.json`, incidentsSchema);
      return incidents;
    },

    clearCache: () => {
      cache.clear();
    },
  };
};
