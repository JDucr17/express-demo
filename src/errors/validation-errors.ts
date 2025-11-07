/**
 * Validation error for Zod schema failures
 */
export const VALIDATION_ERROR = {
  status: 400,
  code: "VALIDATION_ERROR",
  message: "Invalid data",
} as const;
