import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DatabaseError } from 'pg';
import { isAppError, type AppError } from '../shared/app-errors.js';
import { mapDatabaseError } from '../shared/db-errors.js';
import { logger } from '../logging/logger.js';
import { config } from '../config/index.js';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Extract database error from Drizzle wrapper
 * Drizzle wraps all database errors, so we need to extract the original
 */
function extractDbError(error: unknown): DatabaseError | null {
  // Drizzle wraps errors with message "Failed query: ..." and puts original in cause
  if (
    error instanceof Error &&
    error.message.startsWith('Failed query:') &&
    'cause' in error &&
    error.cause instanceof DatabaseError
  ) {
    return error.cause;
  }
  return null;
}

/**
 * Send error response to client
 */
function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
): void {
  const response: ErrorResponse = {
    error: { code, message },
  };

  if (details !== undefined) {
    response.error.details = details;
  }
  
  res.status(status).json(response);
}

/**
 * Handle Zod validation errors
 */
function handleValidationError(err: ZodError, req: Request, res: Response): void {
  logger.info(
    {
      type: 'validation_error',
      method: req.method,
      path: req.path,
      issues: err.issues,
    },
    'Validation failed'
  );

  const details = err.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  sendError(res, 400, 'VALIDATION_ERROR', 'Datos inválidos', details);
}

/**
 * Handle database errors
 */
function handleDatabaseError(err: DatabaseError, req: Request, res: Response): void {
  const mapped = mapDatabaseError(err);

  if (mapped) {
    logger.warn(
      {
        type: 'database_error',
        code: err.code,
        detail: err.detail,
        method: req.method,
        path: req.path,
      },
      `Database error: ${mapped.message}`
    );

    sendError(res, mapped.status, mapped.code, mapped.message);
    return;
  }

  logger.error(
    {
      type: 'unmapped_database_error',
      code: err.code,
      message: err.message,
      detail: err.detail,
      method: req.method,
      path: req.path,
    },
    'Unmapped database error encountered'
  );

  sendError(res, 500, 'DATABASE_ERROR', 'Error en la base de datos');
}

/**
 * Handle application errors
 */
function handleAppError(err: AppError, req: Request, res: Response): void {
  const logLevel = err.statusCode >= 500 ? 'error' : 'info';

  logger[logLevel](
    {
      type: 'app_error',
      code: err.code,
      statusCode: err.statusCode,
      method: req.method,
      path: req.path,
    },
    err.message
  );

  sendError(res, err.statusCode, err.code, err.message);
}

/**
 * Handle unknown errors
 */
function handleUnknownError(err: unknown, req: Request, res: Response): void {
  logger.error(
    {
      type: 'unhandled_error',
      method: req.method,
      path: req.path,
      error:
        err instanceof Error
          ? {
              name: err.name,
              message: err.message,
              stack: err.stack,
            }
          : err,
    },
    'Unhandled error in request'
  );

  const message =
    config.isDevelopment && err instanceof Error 
      ? err.message 
      : 'Error interno del servidor';

  sendError(res, 500, 'INTERNAL_ERROR', message);
}

/**
 * Global error handler middleware
 * 
 * Process flow:
 * 1. Check for validation errors (Zod)
 * 2. Extract database errors from ORM wrappers (Drizzle)
 * 3. Handle application errors
 * 4. Handle unknown errors
 */
export function errorHandler(
  err: unknown, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void {
  // Don't handle if response was already sent
  if (res.headersSent) {
    return next(err);
  }
  
  // 1. Validation errors (Zod)
  if (err instanceof ZodError) {
    return handleValidationError(err, req, res);
  }
  
  // 2. Database errors (extract from Drizzle wrapper if needed)
  const dbError = extractDbError(err);
  if (dbError) {
    return handleDatabaseError(dbError, req, res);
  }
  
  // 3. Application errors
  if (isAppError(err)) {
    return handleAppError(err, req, res);
  }

  // 4. Unknown errors
  handleUnknownError(err, req, res);
}