import { describe, it, expect } from "vitest";

import { NotFoundError, BadRequestError, BusinessRuleError, isAppError } from "../app-errors";

describe("App Errors", () => {
  describe("NotFoundError", () => {
    it("should create error with correct properties for numeric id", () => {
      const error = new NotFoundError("User", 123);

      expect(error.status).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("User 123 not found");
      expect(error.name).toBe("NotFoundError");
    });

    it("should create error with correct properties for string id", () => {
      const error = new NotFoundError("Edificio", "CS");

      expect(error.status).toBe(404);
      expect(error.code).toBe("NOT_FOUND");
      expect(error.message).toBe("Edificio CS not found");
    });

    it("should be instanceof Error", () => {
      const error = new NotFoundError("Test", 1);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("BadRequestError", () => {
    it("should create error with correct properties", () => {
      const error = new BadRequestError("Invalid input data");

      expect(error.status).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
      expect(error.message).toBe("Invalid input data");
      expect(error.name).toBe("BadRequestError");
    });

    it("should be instanceof Error", () => {
      const error = new BadRequestError("Test");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("BusinessRuleError", () => {
    it("should create error with correct properties", () => {
      const error = new BusinessRuleError("Cannot perform this operation");

      expect(error.status).toBe(422);
      expect(error.code).toBe("BUSINESS_RULE_VIOLATION");
      expect(error.message).toBe("Cannot perform this operation");
      expect(error.name).toBe("BusinessRuleError");
    });

    it("should be instanceof Error", () => {
      const error = new BusinessRuleError("Test");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("isAppError", () => {
    it("should reject regular errors", () => {
      const regularError = new Error("Regular error");
      const typeError = new TypeError("Type error");

      expect(isAppError(regularError)).toBe(false);
      expect(isAppError(typeError)).toBe(false);
    });

    it("should reject non-error objects", () => {
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError("string")).toBe(false);
      expect(isAppError(123)).toBe(false);
      expect(isAppError({})).toBe(false);
    });

    it("should reject objects with partial app error shape", () => {
      const partial = { statusCode: 404 };
      expect(isAppError(partial)).toBe(false);
    });
  });
});
