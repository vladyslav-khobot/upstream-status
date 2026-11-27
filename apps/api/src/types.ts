import type { z } from 'zod';

import type { envSchema } from './config.ts';
import type { StatuspageClient } from './statuspage/types.ts';

export type Config = z.infer<typeof envSchema>;

/** A status page we track. All of them expose the public Statuspage v2 JSON API. */
export interface CatalogEntry {
  id: string;
  name: string;
  baseUrl: string;
}

export interface AppDeps {
  config: Pick<Config, 'CORS_ORIGIN' | 'ADMIN_TOKEN'>;
  client: StatuspageClient;
}

export interface ErrorDescription {
  status: number;
  message: string;
}
