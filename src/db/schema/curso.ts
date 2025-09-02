import {
  pgTable,
  serial,
  varchar,
  integer,
  smallint,
  boolean,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { departamento } from './departamento.js';

export const curso = pgTable(
  'curso',
  {
    id: serial().primaryKey().notNull(),
    sigla: varchar({ length: 6 }).notNull(),
    nombre: varchar({ length: 100 }).notNull(),
    idDepartamento: integer('id_departamento').notNull(),
    creditaje: smallint(),
    activo: boolean().default(true).notNull(),
    horas: smallint().default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.idDepartamento],
      foreignColumns: [departamento.id],
      name: 'curso_id_departamento_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);
