import { z } from 'zod';

import { cacheRefreshSchema } from './schemas';
import type { ApiError } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN ?? '';

const errorBodySchema = z.object({ error: z.object({ message: z.string() }) });

export const createApiError = (status: number, message: string): ApiError =>
  Object.assign(new Error(message), { name: 'ApiError' as const, status });

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof Error && error.name === 'ApiError';

/** Sends a request to the API and validates the JSON body against `schema`. */
const request = async <T>(path: string, schema: z.ZodType<T>, init: RequestInit): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  const body: unknown = await response.json().catch(() => null);
  const { ok, status } = response;

  if (!ok) {
    const parsedError = errorBodySchema.safeParse(body);
    throw createApiError(
      status,
      parsedError.success ? parsedError.data.error.message : `Request failed: ${status}`,
    );
  }

  const { success, data } = schema.safeParse(body);
  if (!success) {
    throw createApiError(status, `Unexpected response from ${path}`);
  }
  return data;
};

/**
 * GETs a JSON endpoint.
 * `signal` comes from TanStack Query, so leaving a page cancels its requests.
 */
export const getJson = <T>(path: string, schema: z.ZodType<T>, signal?: AbortSignal): Promise<T> =>
  request(path, schema, { signal: signal ?? null });

/** Asks the API to drop its status page cache and fetch everything again. */
export const refreshServerCache = () =>
  request('/api/admin/cache/refresh', cacheRefreshSchema, {
    method: 'POST',
    headers: { 'x-admin-token': ADMIN_TOKEN },
  });
