/**
 * System Error Responses
 *
 * Generic fallback error responses for unexpected failures.
 */

export const SYSTEM_ERRORS = {
  INTERNAL_ERROR: {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Internal server error",
  },
  DATABASE_ERROR: {
    status: 500,
    code: "DATABASE_ERROR",
    message: "Database error",
  },
} as const;

export type SystemErrorCode = keyof typeof SYSTEM_ERRORS;
