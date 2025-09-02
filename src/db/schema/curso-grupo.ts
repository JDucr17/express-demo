import { pgTable, serial, integer, smallint, foreignKey, unique } from 'drizzle-orm/pg-core';
import { curso } from './curso.js';
import { ciclo } from './ciclo.js';

export const cursoGrupo = pgTable(
  'curso_grupo',
  {
    id: serial().primaryKey().notNull(),
    idCurso: integer('id_curso').notNull(),
    idCiclo: integer('id_ciclo').notNull(),
    numero: smallint().notNull(),
    totalMatricula: smallint('total_matricula').default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.idCurso],
      foreignColumns: [curso.id],
      name: 'curso_grupo_id_curso_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
    foreignKey({
      columns: [table.idCiclo],
      foreignColumns: [ciclo.id],
      name: 'curso_grupo_id_ciclo_fkey',
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
    unique('curso_grupo_id_curso_id_ciclo_numero_key').on(
      table.idCurso,
      table.idCiclo,
      table.numero
    ),
  ]
);
