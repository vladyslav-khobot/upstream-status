import { z } from 'zod';

import type { Config } from './types.ts';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(60_000),
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(5_000),
});

/** Reads and validates configuration once at startup, so a bad env var fails fast. */
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};
