export interface TtlCache<T> {
  getOrLoad: (key: string, load: () => Promise<T>) => Promise<T>;
  clear: () => void;
}

export interface TtlCacheEntry<T> {
  promise: Promise<T>;
  expiresAt: number;
}

/** An error that carries the HTTP status the API should answer with. */
export type HttpError = Error & { name: 'HttpError'; status: number };
