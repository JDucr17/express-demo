import { z } from 'zod';

export const CreateCursoSchema = z.object({
  sigla: z.string().min(1).max(6).toUpperCase(),
  nombre: z.string().min(1).max(100).trim(),
  idDepartamento: z.number().int().positive(),
  creditaje: z.number().int().min(0).max(10).nullable().optional(),
  horas: z.number().int().min(0).max(20).default(0),
  activo: z.boolean().default(true),
});

export const UpdateCursoSchema = z.object({
  sigla: z.string().min(1).max(6).toUpperCase().optional(),
  nombre: z.string().min(1).max(100).trim().optional(),
  idDepartamento: z.number().int().positive().optional(),
  creditaje: z.number().int().min(0).max(10).nullable().optional(),
  horas: z.number().int().min(0).max(20).optional(),
  activo: z.boolean().optional(),
});

export const FindCursosSchema = z.object({
  search: z.string().optional(),
  idDepartamento: z.number().int().positive().optional(),
  activo: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z.enum(['sigla', 'nombre', 'id']).default('sigla'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

// Type exports
export type CreateCursoSchema = z.infer<typeof CreateCursoSchema>;
export type UpdateCursoSchema = z.infer<typeof UpdateCursoSchema>;
export type FindCursosSchema = z.infer<typeof FindCursosSchema>;
export type PaginationSchema = z.infer<typeof PaginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
