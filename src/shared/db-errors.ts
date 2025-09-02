import { DatabaseError } from 'pg';

interface ErrorMapping {
  status: number;
  code: string;
  message: string | ((err: DatabaseError) => string);
}

export const PG_ERROR_MAPPINGS: Record<string, ErrorMapping> = {
  '23505': {
    status: 409,
    code: 'CONFLICT',
    message: 'El registro ya existe',
  },
  '23503': {
    status: 404,
    code: 'FK_NOT_FOUND',
    message: 'La referencia no existe',
  },
  '23502': {
    status: 400,
    code: 'MISSING_FIELD',
    message: (err) => `Campo requerido: ${err.column || 'desconocido'}`,
  },
  '23514': {
    status: 422,
    code: 'CHECK_VIOLATION',
    message: 'Violación de restricción de datos',
  },
};

export function mapDatabaseError(
  err: DatabaseError
): { status: number; code: string; message: string } | null {
  const mapping = PG_ERROR_MAPPINGS[err.code || ''];

  if (!mapping) return null;

  return {
    status: mapping.status,
    code: mapping.code,
    message: typeof mapping.message === 'function' ? mapping.message(err) : mapping.message,
  };
}
