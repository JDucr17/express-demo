import { relations } from 'drizzle-orm/relations';
import { departamento } from './departamento.js';
import { curso } from './curso.js';
import { cursoGrupo } from './curso-grupo.js';
import { ciclo } from './ciclo.js';
import { cursoHorario } from './curso-horario.js';
import { edificio } from './edificio.js';

export const cursoRelations = relations(curso, ({ one, many }) => ({
  departamento: one(departamento, {
    fields: [curso.idDepartamento],
    references: [departamento.id],
  }),
  cursoGrupos: many(cursoGrupo),
}));

export const departamentoRelations = relations(departamento, ({ many }) => ({
  cursos: many(curso),
}));

export const cursoGrupoRelations = relations(cursoGrupo, ({ one, many }) => ({
  curso: one(curso, {
    fields: [cursoGrupo.idCurso],
    references: [curso.id],
  }),
  ciclo: one(ciclo, {
    fields: [cursoGrupo.idCiclo],
    references: [ciclo.id],
  }),
  cursoHorarios: many(cursoHorario),
}));

export const cicloRelations = relations(ciclo, ({ many }) => ({
  cursoGrupos: many(cursoGrupo),
}));

export const cursoHorarioRelations = relations(cursoHorario, ({ one }) => ({
  cursoGrupo: one(cursoGrupo, {
    fields: [cursoHorario.idGrupo],
    references: [cursoGrupo.id],
  }),
  edificio: one(edificio, {
    fields: [cursoHorario.idEdificio],
    references: [edificio.id],
  }),
}));

export const edificioRelations = relations(edificio, ({ many }) => ({
  cursoHorarios: many(cursoHorario),
}));
