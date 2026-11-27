import { z } from 'zod';

import type { Config } from './types.ts';

export const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Short TTL so the dashboard's live refresh actually shows new data.
  CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(10_000),
  // Some status pages are slow from EU regions; give them time instead of showing "unknown".
  UPSTREAM_TIMEOUT_MS: z.coerce.number().int().positive().default(45_000),
  // Token for /api/admin/* endpoints.
  ADMIN_TOKEN: z.string().default(''),
});

/** Reads and validates configuration once at startup, so a bad env var fails fast. */
export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};
