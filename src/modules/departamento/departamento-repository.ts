import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { departamento } from '../../db/schema/index.js';
import type { DepartamentoData } from './departamento-types.js';

export interface DepartamentoRepository {
  findAll(): Promise<DepartamentoData[]>;
}

export const createDepartamentoRepository = (db: NodePgDatabase): DepartamentoRepository => ({
  async findAll() {
    const result = await db.select().from(departamento);
    return result;
  },
});