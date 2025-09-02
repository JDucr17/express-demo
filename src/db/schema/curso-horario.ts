import { pgTable, serial, integer, varchar, smallint, foreignKey } from 'drizzle-orm/pg-core';
import { cursoGrupo } from './curso-grupo.js';
import { edificio } from './edificio.js';

export const cursoHorario = pgTable(
  'curso_horario',
  {
    id: serial().primaryKey().notNull(),
    idGrupo: integer('id_grupo').notNull(),
    dia: varchar({ length: 1 }).notNull(),
    idEdificio: varchar('id_edificio', { length: 2 }),
    aula: varchar({ length: 3 }),
    horaEntrada: smallint('hora_entrada'),
    horaSalida: smallint('hora_salida'),
  },
  (table) => [
    foreignKey({
      columns: [table.idGrupo],
      foreignColumns: [cursoGrupo.id],
      name: 'curso_horario_id_grupo_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.idEdificio],
      foreignColumns: [edificio.id],
      name: 'curso_horario_id_edificio_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ]
);
