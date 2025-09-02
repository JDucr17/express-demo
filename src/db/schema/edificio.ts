import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const edificio = pgTable('edificio', {
  id: varchar({ length: 2 }).primaryKey().notNull(),
  nombre: varchar({ length: 50 }).notNull(),
});
