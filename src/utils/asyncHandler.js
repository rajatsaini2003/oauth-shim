/**
 * Wraps an Express route handler (sync or async) so that thrown errors
 * are forwarded to next() instead of crashing the process.
 *
 * @param {Function} fn
 * @returns {Function}
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
