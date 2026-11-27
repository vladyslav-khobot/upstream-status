import { createApp } from './app.ts';
import { loadConfig } from './config.ts';
import { createStatuspageClient } from './statuspage/client.ts';

const config = loadConfig();
const { PORT, CACHE_TTL_MS, UPSTREAM_TIMEOUT_MS } = config;

const client = createStatuspageClient({
  cacheTtlMs: CACHE_TTL_MS,
  timeoutMs: UPSTREAM_TIMEOUT_MS,
});

const server = createApp({ config, client }).listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// Let in-flight requests finish when the container is stopped (docker stop / ECS sends SIGTERM).
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
