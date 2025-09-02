import { eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { curso, departamento } from '../../db/schema/index.js';
import type {
  CursoData,
  CursoWithDepartamento,
  CreateCursoData,
  UpdateCursoData,
} from './curso-types.js';

/**
 * Repository interface for Curso operations
 */
export interface CursoRepository {
  findAll(): Promise<CursoWithDepartamento[]>;
  findById(id: number): Promise<CursoWithDepartamento | null>;
  findBySigla(sigla: string): Promise<CursoData | null>;
  create(data: CreateCursoData): Promise<CursoData>;
  update(id: number, data: UpdateCursoData): Promise<CursoData | null>;
  delete(id: number): Promise<boolean>;
  toggleActive(id: number): Promise<CursoData | null>;
  findPaginated(params: { page: number; limit: number }): Promise<{
    data: CursoWithDepartamento[];
    total: number;
  }>;
}

/**
 * Create a Curso repository instance
 */
export const createCursoRepository = (db: NodePgDatabase): CursoRepository => ({
  async findAll() {
    const result = await db
      .select()
      .from(curso)
      .innerJoin(departamento, eq(curso.idDepartamento, departamento.id));

    return result.map((row) => ({
      ...row.curso,
      departamento: row.departamento,
    }));
  },

  async findById(id) {
    const result = await db
      .select()
      .from(curso)
      .innerJoin(departamento, eq(curso.idDepartamento, departamento.id))
      .where(eq(curso.id, id))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0].curso,
      departamento: result[0].departamento,
    };
  },

  async findBySigla(sigla) {
    const result = await db.select().from(curso).where(eq(curso.sigla, sigla)).limit(1);

    return result[0] || null;
  },

  async create(data) {
    const result = await db.insert(curso).values(data).returning();

    return result[0];
  },

  async update(id, data) {
    const result = await db.update(curso).set(data).where(eq(curso.id, id)).returning();

    return result[0] || null;
  },

  async delete(id) {
    const result = await db.delete(curso).where(eq(curso.id, id)).returning();

    return result.length > 0;
  },

  async toggleActive(id) {
    const result = await db
      .update(curso)
      .set({
        activo: sql`NOT ${curso.activo}`,
      })
      .where(eq(curso.id, id))
      .returning();

    return result[0] || null;
  },

  async findPaginated({ page, limit }) {
    const offset = (page - 1) * limit;

    const [dataResult, countResult] = await Promise.all([
      db
        .select()
        .from(curso)
        .innerJoin(departamento, eq(curso.idDepartamento, departamento.id))
        .limit(limit)
        .offset(offset),
      db.select({ total: sql<number>`count(*)::int` }).from(curso),
    ]);

    return {
      data: dataResult.map((row) => ({
        ...row.curso,
        departamento: row.departamento,
      })),
      total: countResult[0]?.total || 0,
    };
  },
});
