import { DatabaseError } from 'pg';

/**
 * Error mapping configuration
 */
interface ErrorMapping {
  status: number;
  code: string;
  message: string | ((err: DatabaseError) => string);
}

/**
 * PostgreSQL error code mappings
 */
export const PG_ERROR_MAPPINGS: Record<string, ErrorMapping> = {
  // Class 23 - Integrity Constraint Violation
  '23505': {
    status: 409,
    code: 'CONFLICT',
    message: (err) => err.detail || 'El registro ya existe',
  },
  '23503': {
    status: 404,
    code: 'FK_NOT_FOUND',
    message: (err) => err.detail || 'La referencia no existe',
  },
  '23502': {
    status: 400,
    code: 'MISSING_FIELD',
    message: (err) => err.detail || `Campo requerido: ${err.column || 'desconocido'}`,
  },
  '23514': {
    status: 422,
    code: 'CHECK_VIOLATION',
    message: (err) => err.detail || `Violación de restricción: ${err.constraint || 'check'}`,
  },
  '23000': {
    status: 400,
    code: 'INTEGRITY_VIOLATION',
    message: 'Violación de integridad de datos',
  },
  
  // Class 22 - Data Exception
  '22P02': {
    status: 400,
    code: 'INVALID_TEXT',
    message: 'Formato de texto inválido',
  },
  '22001': {
    status: 400,
    code: 'STRING_TOO_LONG',
    message: (err) => err.detail || 'El valor excede la longitud máxima permitida',
  },
  '22003': {
    status: 400,
    code: 'NUMERIC_OUT_OF_RANGE',
    message: (err) => err.detail || 'Valor numérico fuera de rango',
  },
  
  // Class 42 - Syntax Error or Access Rule Violation  
  '42703': {
    status: 500,
    code: 'UNDEFINED_COLUMN',
    message: (err) => err.detail || 'Columna no definida',
  },
  '42P01': {
    status: 500,
    code: 'UNDEFINED_TABLE',
    message: (err) => err.detail || 'Tabla no definida',
  },
};

/**
 * Map PostgreSQL database errors to HTTP responses
 * 
 * @param err - The PostgreSQL DatabaseError
 * @returns Mapped error response or null if no mapping exists
 */
export function mapDatabaseError(
  err: DatabaseError
): { status: number; code: string; message: string } | null {
  const mapping = PG_ERROR_MAPPINGS[err.code || ''];

  if (!mapping) {
    return null;
  }

  return {
    status: mapping.status,
    code: mapping.code,
    message: typeof mapping.message === 'function' 
      ? mapping.message(err) 
      : mapping.message,
  };
}