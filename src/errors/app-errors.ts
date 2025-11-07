import type { BaseError } from "./types";

//export interface AppError extends BaseError {
// App errors may need additional fields in the future
//}

export class NotFoundError extends Error implements BaseError {
  status = 404;
  code = "NOT_FOUND";

  constructor(resource: string, id?: string | number) {
    super(id === undefined ? `${resource} not found` : `${resource} ${id} not found`);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends Error implements BaseError {
  status = 400;
  code = "BAD_REQUEST";

  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

export class BusinessRuleError extends Error implements BaseError {
  status = 422;
  code: string;

  constructor(message: string, code = "BUSINESS_RULE_VIOLATION") {
    super(message);
    this.name = "BusinessRuleError";
    this.code = code;
  }
}

export function isAppError(err: unknown): err is BaseError {
  return err instanceof Error && "status" in err && "code" in err;
}
