export interface AppError {
  statusCode: number;
  code: string;
  message: string;
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(resource: string, id: string | number) {
    super(`${resource} ${id} no encontrado`);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends Error implements AppError {
  statusCode = 422;
  code = 'BUSINESS_RULE';

  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof Error && 'statusCode' in err && 'code' in err;
}
