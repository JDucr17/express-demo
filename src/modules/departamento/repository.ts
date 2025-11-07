import { eq, sql, and, SQL } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

import type {
  DepartamentoData,
  DepartamentoListItem,
  CreateDepartamentoData,
  UpdateDepartamentoData,
} from "./types";
import type { GetDepartamentosSchema, GetDepartamentosListSchema } from "./validation";

import { departamento } from "@/db/schema";
import { db } from "@/db/config";
import { unaccentIlike } from "@/db/utils";

/**
 * Repository interface for Departamento operations
 */
export interface DepartamentoRepository {
  findPaginated(params: GetDepartamentosSchema): Promise<{
    data: DepartamentoData[];
    total: number;
  }>;

  findForSelect(params: GetDepartamentosListSchema): Promise<DepartamentoListItem[]>;

  findById(id: number): Promise<DepartamentoData | null>;
  create(data: CreateDepartamentoData): Promise<DepartamentoData>;
  update(id: number, data: UpdateDepartamentoData): Promise<DepartamentoData | null>;
  delete(id: number): Promise<boolean>;
}

/**
 * Builds a WHERE condition for filtering departamentos
 * Combines estado filter and search query with AND logic
 */
const buildWhereCondition = (params: { estado?: string; q?: string }): SQL | undefined => {
  const conditions: SQL[] = [];

  if (params.estado !== undefined) {
    conditions.push(eq(departamento.estado, params.estado));
  }

  if (params.q !== undefined) {
    conditions.push(unaccentIlike(departamento.nombre, `%${params.q}%`));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
};

/**
 * Departamento repository factory
 */
export const DepartamentoRepository = (database: NodePgDatabase): DepartamentoRepository => ({
  async findPaginated({ page, limit, estado, q }) {
    const whereCondition = buildWhereCondition({ estado, q });
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      database
        .select()
        .from(departamento)
        .where(whereCondition)
        .orderBy(departamento.nombre)
        .limit(limit)
        .offset(offset),

      database
        .select({ total: sql<number>`count(*)::int` })
        .from(departamento)
        .where(whereCondition),
    ]);

    return {
      data,
      total: countResult[0]?.total || 0,
    };
  },

  async findForSelect({ estado, q }) {
    const whereCondition = buildWhereCondition({ estado, q });

    const result = await database
      .select({
        id: departamento.id,
        nombre: departamento.nombre,
      })
      .from(departamento)
      .where(whereCondition)
      .orderBy(departamento.nombre);

    return result;
  },

  async findById(id) {
    const result = await database
      .select()
      .from(departamento)
      .where(eq(departamento.id, id))
      .limit(1);

    return result[0] || null;
  },

  async create(data) {
    const result = await database.insert(departamento).values(data).returning();

    return result[0];
  },

  async update(id, data) {
    const result = await database
      .update(departamento)
      .set(data)
      .where(eq(departamento.id, id))
      .returning();

    return result[0] || null;
  },

  async delete(id) {
    const result = await database.delete(departamento).where(eq(departamento.id, id)).returning();

    return result.length > 0;
  },
});

// Instantiate repository
export const departamentoRepository = DepartamentoRepository(db);
