import type { HttpError } from './types.ts';

export const createHttpError = (status: number, message: string): HttpError =>
  Object.assign(new Error(message), { name: 'HttpError' as const, status });

export const isHttpError = (error: unknown): error is HttpError =>
  error instanceof Error && error.name === 'HttpError';
