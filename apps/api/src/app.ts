import cors from 'cors';
import express from 'express';
import type { ErrorRequestHandler } from 'express';

import type { ErrorResponse } from './contract.ts';
import { createHttpError, isHttpError } from './lib/http-error.ts';
import { servicesRouter } from './routes/services.ts';
import { isUpstreamError } from './statuspage/upstream-error.ts';
import type { AppDeps, ErrorDescription } from './types.ts';

/** Maps a thrown error to the HTTP status and message the client gets. */
const describeError = (error: unknown): ErrorDescription => {
  if (isHttpError(error)) {
    const { status, message } = error;
    return { status, message };
  }
  if (isUpstreamError(error)) {
    return { status: 502, message: error.message };
  }
  // Anything else is a bug: log it, but do not leak details to the client.
  console.error(error);
  return { status: 500, message: 'Internal server error' };
};

// Express 5 forwards rejected promises from async handlers here, so routes can simply throw.
const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const { status, message } = describeError(error);
  res.status(status).json({ error: { message } } satisfies ErrorResponse);
};

export const createApp = ({ config: { CORS_ORIGIN }, client }: AppDeps) => {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: CORS_ORIGIN }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/services', servicesRouter(client));

  app.use((_req, _res, next) => {
    next(createHttpError(404, 'Not found'));
  });

  app.use(errorHandler);

  return app;
};
