import { randomUUID } from 'node:crypto';
import type { RequestHandler } from 'express';
import { logger } from '../lib/logger.js';

const requestContext: RequestHandler = (req, res, next): void => {
  const suppliedId = req.get('X-Request-ID');
  const requestId = suppliedId && /^[a-zA-Z0-9._-]{1,64}$/.test(suppliedId)
    ? suppliedId : randomUUID();
  const start = performance.now();
  // Routers can temporarily rewrite req.url; capture the original path now.
  const path = req.path;
  const method = req.method;
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  let recorded = false;
  function record(aborted: boolean) {
    if (recorded) return;
    recorded = true;
    // No query strings, request bodies, cookies or authorization headers.
    const fields = {
      requestId,
      method,
      path,
      statusCode: aborted ? 499 : res.statusCode,
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    };
    if (aborted) logger.warn(fields, 'Request aborted');
    else if (res.statusCode >= 500) logger.error(fields, 'Request completed');
    else if (res.statusCode >= 400) logger.warn(fields, 'Request completed');
    else logger.info(fields, 'Request completed');
  }
  res.once('finish', () => record(false));
  res.once('close', () => { if (!res.writableFinished) record(true); });
  next();
};

export { requestContext };
