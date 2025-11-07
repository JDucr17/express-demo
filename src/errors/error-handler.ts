import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { DatabaseError } from "pg";

import { isAppError } from "./app-errors";
import { mapDbError, extractDbError, type DbErrorMapping } from "./db-errors";
import { JSON_ERRORS, isJsonParseError } from "./middleware-errors";
import { VALIDATION_ERROR } from "./validation-errors";
import { SYSTEM_ERRORS } from "./system-errors";
import type { BaseError, ErrorResponse } from "./types";

import { logger } from "@/logging/logger";
import { config } from "@/config/config";

/**
 * Send error from a static definition (BaseError shape)
 */
function sendErrorFromDefinition(
  res: Response,
  definition: BaseError,
  details?: Record<string, unknown>,
): void {
  const payload: ErrorResponse = {
    error: {
      code: definition.code,
      message: definition.message,
    },
  };

  if (config.isDevelopment && details) {
    payload.error.details = details;
  }

  res.status(definition.status).json(payload);
}

/**
 * Send database error with headers and runtime details
 */
function sendDatabaseErrorMapping(res: Response, mapping: DbErrorMapping): void {
  if (mapping.headers) {
    Object.entries(mapping.headers).forEach(([k, v]) => {
      res.setHeader(k, v);
    });
  }

  const payload: ErrorResponse = {
    error: {
      code: mapping.code,
      message: mapping.message,
    },
  };

  if (config.isDevelopment && mapping.details) {
    payload.error.details = mapping.details;
  }

  res.status(mapping.status).json(payload);
}

// === Helper Functions ===

/** Zod validation: 400 */
function handleValidationError(err: ZodError, req?: Request, res?: Response): void {
  logger.info(
    {
      type: "validation_error",
      method: req?.method,
      path: req?.path,
      issues: err.issues,
    },
    "Validation failed",
  );

  const details = {
    issues: err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };

  if (res) sendErrorFromDefinition(res, VALIDATION_ERROR, details);
}

/** Database errors -> mapped HTTP codes */
function handleDatabaseError(err: DatabaseError, req?: Request, res?: Response): void {
  const mapped = mapDbError(err, {
    method: req?.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  });

  if (mapped) {
    logger.warn(
      {
        type: "database_error",
        sqlstate: err.code,
        table: err.table,
        schema: err.schema,
        constraint: err.constraint,
        method: req?.method,
        path: req?.path,
        mapped,
      },
      `Database error → ${mapped.status} ${mapped.code}`,
    );

    if (res) return sendDatabaseErrorMapping(res, mapped);
    return;
  }

  // Unmapped DB error: 500
  logger.error(
    {
      type: "unmapped_database_error",
      sqlstate: err.code,
      message: err.message,
      detail: err.detail,
    },
    "Unmapped database error",
  );

  if (res) sendErrorFromDefinition(res, SYSTEM_ERRORS.DATABASE_ERROR);
}

/** App-level errors with explicit status/code */
function handleAppError(err: BaseError, req?: Request, res?: Response): void {
  const level = err.status >= 500 ? "error" : "info";
  logger[level](
    {
      type: "app_error",
      code: err.code,
      status: err.status,
      method: req?.method,
      path: req?.path,
    },
    err.message,
  );

  if (res) sendErrorFromDefinition(res, err);
}

/** Unknown/unexpected errors: 500 */
function handleUnknownError(err: unknown, req?: Request, res?: Response): void {
  logger.error(
    {
      type: "unhandled_error",
      method: req?.method,
      path: req?.path,
      error:
        err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    },
    "Unhandled error in request",
  );

  if (res) sendErrorFromDefinition(res, SYSTEM_ERRORS.INTERNAL_ERROR);
}

/** JSON parsing errors */
function handleJsonError(err: unknown, req?: Request, res?: Response): void {
  if (!isJsonParseError(err)) return;

  logger.info(
    {
      type: "json_parse_error",
      errorType: err.type,
      method: req?.method,
      path: req?.path,
    },
    "JSON parse error",
  );

  if (!res) return;

  switch (err.type) {
    case "entity.too.large":
      return sendErrorFromDefinition(res, JSON_ERRORS.PAYLOAD_TOO_LARGE);
    case "encoding.unsupported":
      return sendErrorFromDefinition(res, JSON_ERRORS.UNSUPPORTED_MEDIA_TYPE);
    default:
      return sendErrorFromDefinition(res, JSON_ERRORS.INVALID_JSON);
  }
}

// === Main Handler ===

/**
 * Centralized error handler
 * Can be used in HTTP middleware, cron jobs, process errors, etc.
 */
export function handleError(err: unknown, res?: Response, req?: Request): void {
  if (err instanceof ZodError) {
    return handleValidationError(err, req, res);
  }
  if (isAppError(err)) {
    return handleAppError(err, req, res);
  }

  if (isJsonParseError(err)) {
    return handleJsonError(err, req, res);
  }

  const dbErr = extractDbError(err);
  if (dbErr) {
    return handleDatabaseError(dbErr, req, res);
  }

  handleUnknownError(err, req, res);
}
