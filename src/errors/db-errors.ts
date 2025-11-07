import type { DatabaseError } from "pg";

import type { BaseError } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface DbErrorMapping extends BaseError {
  headers?: Record<string, string>;
  details?: Record<string, unknown>;
}

export interface HttpContext {
  method?: HttpMethod;
}

/**
 * Static database error responses
 */
const DB_ERROR_RESPONSES = {
  SERVICE_UNAVAILABLE: {
    status: 503,
    code: "SERVICE_UNAVAILABLE",
    message: "Temporary database issue. Please retry.",
    headers: { "Retry-After": "1" },
  },
  FORBIDDEN: {
    status: 403,
    code: "FORBIDDEN",
    message: "Access denied",
  },
  DUPLICATE: {
    status: 409,
    code: "DUPLICATE",
    message: "Resource already exists.",
  },
  HAS_DEPENDENCIES: {
    status: 409,
    code: "HAS_DEPENDENCIES",
    message: "Cannot delete: dependent records exist.",
  },
  INVALID_REFERENCE: {
    status: 422,
    code: "INVALID_REFERENCE",
    message: "Referenced entity does not exist.",
  },
  REQUIRED_FIELD: {
    status: 422,
    code: "REQUIRED_FIELD",
    message: "Field is required.",
  },
  CHECK_FAILED: {
    status: 422,
    code: "CHECK_FAILED",
    message: "Value failed validation.",
  },
  INVALID_FORMAT: {
    status: 422,
    code: "INVALID_FORMAT",
    message: "Invalid input.",
  },
  INTEGRITY_VIOLATION: {
    status: 400,
    code: "INTEGRITY_VIOLATION",
    message: "Data integrity constraint violated",
  },
} as const;

/**
 * Direct code-to-response mappings (no context needed)
 */
const ERROR_CODE_MAP: Record<string, keyof typeof DB_ERROR_RESPONSES> = {
  // Transient / retryable infra errors
  "40P01": "SERVICE_UNAVAILABLE", // deadlock
  "40001": "SERVICE_UNAVAILABLE", // serialization failure
  "55P03": "SERVICE_UNAVAILABLE", // lock not available
  "08000": "SERVICE_UNAVAILABLE", // connection exception
  "08006": "SERVICE_UNAVAILABLE", // connection failure
  "57P03": "SERVICE_UNAVAILABLE", // cannot connect now
  "53300": "SERVICE_UNAVAILABLE", // too many connections
  "53200": "SERVICE_UNAVAILABLE", // out of memory
  "53100": "SERVICE_UNAVAILABLE", // disk full
  "25006": "SERVICE_UNAVAILABLE", // read-only SQL transaction

  // Permission / RLS
  "42501": "FORBIDDEN",

  // Unique violation
  "23505": "DUPLICATE",

  // NOT NULL required
  "23502": "REQUIRED_FIELD",

  // CHECK constraint
  "23514": "CHECK_FAILED",

  // Data format/range errors
  "22P02": "INVALID_FORMAT", // invalid text representation
  "22001": "INVALID_FORMAT", // string data right truncation
  "22003": "INVALID_FORMAT", // numeric value out of range
  "22007": "INVALID_FORMAT", // invalid datetime format
  "22008": "INVALID_FORMAT", // datetime field overflow
};

/**
 * Build standard error details from database error
 */
function buildDbErrorDetails(err: DatabaseError, sqlstate: string): Record<string, unknown> {
  return {
    sqlstate,
    schema: err.schema,
    table: err.table,
    constraint: err.constraint,
    column: err.column,
  };
}

export function mapDbError(err: DatabaseError, ctx: HttpContext = {}): DbErrorMapping | null {
  const code = err.code ?? "";

  // Check direct mappings first
  if (code in ERROR_CODE_MAP) {
    return {
      ...DB_ERROR_RESPONSES[ERROR_CODE_MAP[code]],
      details: buildDbErrorDetails(err, code),
    };
  }

  // Foreign key violation (context-dependent)
  if (code === "23503") {
    const responseKey = ctx.method === "DELETE" ? "HAS_DEPENDENCIES" : "INVALID_REFERENCE";
    return {
      ...DB_ERROR_RESPONSES[responseKey],
      details: buildDbErrorDetails(err, code),
    };
  }

  // Integrity class fallback (23xxx)
  if (code.startsWith("23")) {
    return {
      ...DB_ERROR_RESPONSES.INTEGRITY_VIOLATION,
      details: buildDbErrorDetails(err, code),
    };
  }

  return null;
}

/**
 * Extract the original pg DatabaseError
 *
 * Handles two cases:
 * 1. Direct DatabaseError (from raw pg queries)
 * 2. Drizzle-wrapped error (DatabaseError in .cause property)
 */
export function extractDbError(err: unknown): DatabaseError | null {
  // Case 1: Direct DatabaseError
  if (isDatabaseError(err)) {
    return err;
  }

  // Case 2: Drizzle wraps it in Error.cause (v0.44+)
  if (err instanceof Error && isDatabaseError(err.cause)) {
    return err.cause;
  }

  return null;
}

/**
 * Type guard for DatabaseError
 * DatabaseError has specific properties that identify it
 */
function isDatabaseError(err: unknown): err is DatabaseError {
  return (
    err !== null &&
    err !== undefined &&
    typeof err === "object" &&
    "code" in err &&
    "severity" in err &&
    typeof (err as DatabaseError).code === "string"
  );
}
