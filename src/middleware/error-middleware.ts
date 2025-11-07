import type { Request, Response, NextFunction } from "express";

import { handleError } from "@/errors/error-handler";

/**
 * Express error middleware
 *
 * This middleware's only job is to catch errors and forward them
 * to the centralized error handler. All the actual error handling
 * logic lives in handleError() function.
 *
 * Usage:
 *   app.use(errorMiddleware);  // Must be last middleware
 */
export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Don't handle if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Forward to centralized handler
  handleError(err, res, req);
}
