import { z } from "zod";

import { createSearchSchema, PaginationSchema } from "@/shared/validation/common-schemas";

export const CreateDepartamentoSchema = z.object({
  nombre: z.string().trim().min(1).max(100),
  estado: z.enum(["Activo", "Inactivo"]).default("Activo"),
});

export const UpdateDepartamentoSchema = z.object({
  nombre: z.string().trim().min(1).max(100).optional(),
  estado: z.enum(["Activo", "Inactivo"]).optional(),
});

/**
 * Unified schema for the main GET /departamentos endpoint
 * Handles: listing, pagination, filtering, and search
 */
export const GetDepartamentosSchema = PaginationSchema.extend({
  estado: z.enum(["Activo", "Inactivo"]).optional(),
  q: createSearchSchema(100),
});

/**
 * Schema for GET /departamentos/list convenience endpoint
 * Lightweight endpoint for dropdowns/forms
 */
export const GetDepartamentosListSchema = z.object({
  q: createSearchSchema(100),
  estado: z.enum(["Activo", "Inactivo"]).default("Activo"),
});

// Type exports
export type GetDepartamentosSchema = z.infer<typeof GetDepartamentosSchema>;
export type GetDepartamentosListSchema = z.infer<typeof GetDepartamentosListSchema>;
export type CreateDepartamentoSchema = z.infer<typeof CreateDepartamentoSchema>;
export type UpdateDepartamentoSchema = z.infer<typeof UpdateDepartamentoSchema>;
