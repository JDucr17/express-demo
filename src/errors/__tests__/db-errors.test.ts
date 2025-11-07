import { describe, it, expect } from "vitest";
import type { DatabaseError } from "pg";

import { mapDbError } from "../db-errors";

// Mock database errors
function createDbError(code: string, overrides?: Partial<DatabaseError>): DatabaseError {
  return {
    name: "error",
    message: "Database error",
    code,
    length: 0,
    severity: "ERROR",
    schema: "public",
    table: "test_table",
    constraint: "test_constraint",
    column: "test_column",
    ...overrides,
  } as DatabaseError;
}

describe("Database Error Mapping", () => {
  describe("Transient errors (503)", () => {
    it("should map deadlock to SERVICE_UNAVAILABLE", () => {
      const error = createDbError("40P01");
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 503,
        code: "SERVICE_UNAVAILABLE",
        message: "Temporary database issue. Please retry.",
        headers: { "Retry-After": "1" },
      });
    });

    it("should map serialization failure to SERVICE_UNAVAILABLE", () => {
      const error = createDbError("40001");
      const result = mapDbError(error);

      expect(result?.status).toBe(503);
      expect(result?.code).toBe("SERVICE_UNAVAILABLE");
    });

    it("should include retry header for transient errors", () => {
      const error = createDbError("55P03");
      const result = mapDbError(error);

      expect(result?.headers?.["Retry-After"]).toBe("1");
    });
  });

  describe("Permission errors (403)", () => {
    it("should map insufficient privilege to FORBIDDEN", () => {
      const error = createDbError("42501");
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 403,
        code: "FORBIDDEN",
      });
    });
  });

  describe("Unique violations (409)", () => {
    it("should map unique violation to DUPLICATE", () => {
      const error = createDbError("23505", {
        constraint: "users_email_key",
      });
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 409,
        code: "DUPLICATE",
        message: "Resource already exists.",
      });
      expect(result?.details).toHaveProperty("constraint", "users_email_key");
    });
  });

  describe("Foreign key violations (409/422)", () => {
    it("should map DELETE with FK violation to HAS_DEPENDENCIES", () => {
      const error = createDbError("23503");
      const result = mapDbError(error, { method: "DELETE" });

      expect(result).toMatchObject({
        status: 409,
        code: "HAS_DEPENDENCIES",
        message: "Cannot delete: dependent records exist.",
      });
    });

    it("should map non-DELETE FK violation to INVALID_REFERENCE", () => {
      const error = createDbError("23503");
      const result = mapDbError(error, { method: "POST" });

      expect(result).toMatchObject({
        status: 422,
        code: "INVALID_REFERENCE",
        message: "Referenced entity does not exist.",
      });
    });

    it("should default to INVALID_REFERENCE without context", () => {
      const error = createDbError("23503");
      const result = mapDbError(error);

      expect(result?.status).toBe(422);
      expect(result?.code).toBe("INVALID_REFERENCE");
    });
  });

  describe("Validation errors (422)", () => {
    it("should map NOT NULL violation to REQUIRED_FIELD", () => {
      const error = createDbError("23502", {
        column: "email",
      });
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 422,
        code: "REQUIRED_FIELD",
        message: "Field is required.",
      });
      expect(result?.details).toHaveProperty("column", "email");
    });

    it("should map CHECK constraint to CHECK_FAILED", () => {
      const error = createDbError("23514", {
        constraint: "positive_amount",
      });
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 422,
        code: "CHECK_FAILED",
        message: "Value failed validation.",
      });
    });

    it("should map invalid text representation to INVALID_FORMAT", () => {
      const error = createDbError("22P02");
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 422,
        code: "INVALID_FORMAT",
        message: "Invalid input.",
      });
    });

    it("should map string truncation to INVALID_FORMAT", () => {
      const error = createDbError("22001");
      const result = mapDbError(error);

      expect(result?.status).toBe(422);
      expect(result?.code).toBe("INVALID_FORMAT");
    });

    it("should map numeric out of range to INVALID_FORMAT", () => {
      const error = createDbError("22003");
      const result = mapDbError(error);

      expect(result?.status).toBe(422);
      expect(result?.code).toBe("INVALID_FORMAT");
    });
  });

  describe("General integrity violations (400)", () => {
    it("should map unknown 23xxx codes to INTEGRITY_VIOLATION", () => {
      const error = createDbError("23999");
      const result = mapDbError(error);

      expect(result).toMatchObject({
        status: 400,
        code: "INTEGRITY_VIOLATION",
      });
    });
  });

  describe("Unmapped errors", () => {
    it("should return null for unrecognized error codes", () => {
      const error = createDbError("99999");
      const result = mapDbError(error);

      expect(result).toBeNull();
    });

    it("should return null for empty error code", () => {
      const error = createDbError("");
      const result = mapDbError(error);

      expect(result).toBeNull();
    });
  });

  describe("Error details", () => {
    it("should include all available metadata in details", () => {
      const error = createDbError("23505", {
        schema: "custom_schema",
        table: "users",
        constraint: "users_email_key",
      });
      const result = mapDbError(error);

      expect(result?.details).toMatchObject({
        sqlstate: "23505",
        schema: "custom_schema",
        table: "users",
        constraint: "users_email_key",
      });
    });

    it("should handle missing metadata gracefully", () => {
      const error = createDbError("23505", {
        schema: undefined,
        table: undefined,
        constraint: undefined,
      });
      const result = mapDbError(error);

      expect(result).toBeDefined();
      expect(result?.status).toBe(409);
    });
  });
});
