import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

export const departamento = pgTable('departamento', {
  id: integer().primaryKey().notNull(),
  nombre: varchar({ length: 50 }).notNull(),
});
