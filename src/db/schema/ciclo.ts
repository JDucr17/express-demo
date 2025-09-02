import { pgTable, integer, smallint } from 'drizzle-orm/pg-core';

export const ciclo = pgTable('ciclo', {
  id: integer().primaryKey().notNull(),
  periodo: smallint().notNull(),
  anno: smallint().notNull(),
});
