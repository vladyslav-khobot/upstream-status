import { z } from 'zod';

import type { ApiError } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

const errorBodySchema = z.object({ error: z.object({ message: z.string() }) });

export const createApiError = (status: number, message: string): ApiError =>
  Object.assign(new Error(message), { name: 'ApiError' as const, status });

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof Error && error.name === 'ApiError';

/**
 * GETs a JSON endpoint and validates the body.
 * `signal` comes from TanStack Query, so leaving a page cancels its requests.
 */
export const getJson = async <T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { accept: 'application/json' },
    signal: signal ?? null,
  });
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
