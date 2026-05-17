import { AppError } from '../errors/AppError.js';

/**
 * Global Express error handler.
 * Converts AppError subclasses to their HTTP status codes.
 * All other errors produce a generic 500.
 *
 * Must be registered last (4-argument signature tells Express it's an error handler).
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).type('text/plain').send(err.message);
  }

  process.stderr.write(`[shim] Unhandled error: ${err?.stack ?? err}\n`);
  res.status(500).type('text/plain').send('Internal server error');
}
