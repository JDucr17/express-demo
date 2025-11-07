import { relations } from "drizzle-orm/relations";

import {
  administrativoCargo,
  adminPuesto,
  ciclo,
  cursoGrupo,
  curso,
  departamento,
  edificio,
  cursoHorario,
  proyCentro,
  proyecto,
  proyTipo,
  adminNombramiento,
  profesor,
  profJornada,
  presupuesto,
  profCondicion,
  profEstado,
  profGrado,
  profCategoria,
} from "./schema";

export const adminPuestoRelations = relations(adminPuesto, ({ one, many }) => ({
  administrativoCargo: one(administrativoCargo, {
    fields: [adminPuesto.idCargo],
    references: [administrativoCargo.id],
  }),
  adminNombramientos: many(adminNombramiento),
}));

export const administrativoCargoRelations = relations(administrativoCargo, ({ many }) => ({
  adminPuestos: many(adminPuesto),
  adminNombramientos: many(adminNombramiento),
}));

export const cursoGrupoRelations = relations(cursoGrupo, ({ one, many }) => ({
  ciclo: one(ciclo, {
    fields: [cursoGrupo.idCiclo],
    references: [ciclo.id],
  }),
  curso: one(curso, {
    fields: [cursoGrupo.idCurso],
    references: [curso.id],
  }),
  cursoHorarios: many(cursoHorario),
}));

export const cicloRelations = relations(ciclo, ({ many }) => ({
  cursoGrupos: many(cursoGrupo),
  adminNombramientos: many(adminNombramiento),
  profJornadas: many(profJornada),
}));

export const cursoRelations = relations(curso, ({ one, many }) => ({
  cursoGrupos: many(cursoGrupo),
  departamento: one(departamento, {
    fields: [curso.idDepartamento],
    references: [departamento.id],
  }),
}));

export const departamentoRelations = relations(departamento, ({ many }) => ({
  cursos: many(curso),
}));

export const cursoHorarioRelations = relations(cursoHorario, ({ one }) => ({
  edificio: one(edificio, {
    fields: [cursoHorario.idEdificio],
    references: [edificio.id],
  }),
  cursoGrupo: one(cursoGrupo, {
    fields: [cursoHorario.idGrupo],
    references: [cursoGrupo.id],
  }),
}));

export const edificioRelations = relations(edificio, ({ many }) => ({
  cursoHorarios: many(cursoHorario),
}));

export const proyectoRelations = relations(proyecto, ({ one }) => ({
  proyCentro: one(proyCentro, {
    fields: [proyecto.idCentro],
    references: [proyCentro.id],
  }),
  proyTipo: one(proyTipo, {
    fields: [proyecto.idTipo],
    references: [proyTipo.id],
  }),
}));

export const proyCentroRelations = relations(proyCentro, ({ many }) => ({
  proyectos: many(proyecto),
}));

export const proyTipoRelations = relations(proyTipo, ({ many }) => ({
  proyectos: many(proyecto),
}));

export const adminNombramientoRelations = relations(adminNombramiento, ({ one }) => ({
  administrativoCargo: one(administrativoCargo, {
    fields: [adminNombramiento.idCargo],
    references: [administrativoCargo.id],
  }),
  ciclo: one(ciclo, {
    fields: [adminNombramiento.idCiclo],
    references: [ciclo.id],
  }),
  profesor: one(profesor, {
    fields: [adminNombramiento.idProfesor],
    references: [profesor.id],
  }),
  adminPuesto: one(adminPuesto, {
    fields: [adminNombramiento.idPuesto],
    references: [adminPuesto.id],
  }),
}));

export const profesorRelations = relations(profesor, ({ many }) => ({
  adminNombramientos: many(adminNombramiento),
  profJornadas: many(profJornada),
}));

export const profJornadaRelations = relations(profJornada, ({ one }) => ({
  profesor: one(profesor, {
    fields: [profJornada.idProfesor],
    references: [profesor.id],
  }),
  ciclo: one(ciclo, {
    fields: [profJornada.idCiclo],
    references: [ciclo.id],
  }),
  presupuesto: one(presupuesto, {
    fields: [profJornada.idPresupuesto],
    references: [presupuesto.id],
  }),
}));

export const presupuestoRelations = relations(presupuesto, ({ many }) => ({
  profJornadas: many(profJornada),
}));

export const profEstadoRelations = relations(profEstado, ({ one }) => ({
  profCondicion: one(profCondicion, {
    fields: [profEstado.idCondicion],
    references: [profCondicion.id],
  }),
  profGrado: one(profGrado, {
    fields: [profEstado.idGrado],
    references: [profGrado.id],
  }),
  profCategoria: one(profCategoria, {
    fields: [profEstado.idCategoria],
    references: [profCategoria.id],
  }),
}));

export const profCondicionRelations = relations(profCondicion, ({ many }) => ({
  profEstados: many(profEstado),
}));

export const profGradoRelations = relations(profGrado, ({ many }) => ({
  profEstados: many(profEstado),
}));

export const profCategoriaRelations = relations(profCategoria, ({ many }) => ({
  profEstados: many(profEstado),
}));
