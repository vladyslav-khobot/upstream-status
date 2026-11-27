import type { UpstreamError } from './types.ts';

export const createUpstreamError = (message: string, cause?: unknown): UpstreamError =>
  Object.assign(new Error(message, { cause }), { name: 'UpstreamError' as const });

export const isUpstreamError = (error: unknown): error is UpstreamError =>
  error instanceof Error && error.name === 'UpstreamError';
