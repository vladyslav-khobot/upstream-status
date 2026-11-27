import type { TtlCache, TtlCacheEntry } from './types.ts';

/**
 * In-memory cache that stores promises rather than values.
 *
 * Storing the promise means concurrent requests for the same key share one
 * upstream call instead of each starting their own (no cache stampede when
 * the dashboard opens and asks for every service at once).
 */
export const createTtlCache = <T>(ttlMs: number, now: () => number = Date.now): TtlCache<T> => {
  const entries = new Map<string, TtlCacheEntry<T>>();

  const getOrLoad = (key: string, load: () => Promise<T>): Promise<T> => {
    const cached = entries.get(key);
    if (cached && cached.expiresAt > now()) {
      return cached.promise;
    }

    const promise = load();
    entries.set(key, { promise, expiresAt: now() + ttlMs });

    // Never cache failures: the next caller should retry instead of getting the same error for a whole TTL.
    promise.catch(() => {
      if (entries.get(key)?.promise === promise) {
        entries.delete(key);
      }
    });

    return promise;
  };

  return {
    getOrLoad,
    clear: () => {
      entries.clear();
    },
  };
};
