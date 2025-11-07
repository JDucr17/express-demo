/**
 * Test utilities and helpers
 */

/**
 * Helper function to simulate database error creation
 */
export function createDbError(code: string, constraint?: string, table?: string): Error {
  const error = new Error("Database error");
  error.cause = {
    code,
    severity: "ERROR",
    constraint,
    table,
  };
  return error;
}
