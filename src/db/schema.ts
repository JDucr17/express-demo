import {
  pgTable,
  integer,
  smallint,
  varchar,
  foreignKey,
  serial,
  unique,
  boolean,
  check,
  text,
  date,
  primaryKey,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const cursoNombramiento = pgTable("curso_nombramiento", {
  id: integer().primaryKey().notNull(),
  idGrupo: integer("id_grupo").notNull(),
  idProfesor: integer("id_profesor").notNull(),
  cargaHoras: smallint("carga_horas").default(0).notNull(),
  observacion: varchar({ length: 50 }),
});

export const proyNombramiento = pgTable("proy_nombramiento", {
  id: integer().notNull(),
  idProfesor: integer("id_profesor").notNull(),
  idProyecto: integer("id_proyecto").notNull(),
  idCiclo: integer("id_ciclo").notNull(),
  idPuesto: integer("id_puesto"),
  cargaHoras: smallint("carga_horas").default(0).notNull(),
  refDoc: varchar("ref_doc", { length: 20 }),
  vigenciaInicio: varchar("vigencia_inicio", { length: 10 }),
  vigenciaFin: varchar("vigencia_fin", { length: 10 }),
});

export const proyPuesto = pgTable(
  "proy_puesto",
  {
    id: integer()
      .primaryKey()
      .generatedByDefaultAsIdentity({
        name: "proy_puesto_id_seq",
        startWith: 1,
        increment: 1,
        minValue: 1,
        maxValue: 2147483647,
        cache: 1,
      }),
    idTipo: integer("id_tipo").notNull(),
    nombre: varchar({ length: 50 }).notNull(),
  },
  (table) => [unique("proy_puesto_id_key").on(table.id)],
);

export const ciclo = pgTable("ciclo", {
  id: integer().primaryKey().generatedByDefaultAsIdentity({
    name: "ciclo_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 2147483647,
    cache: 1,
  }),
  periodo: smallint().notNull(),
  anno: smallint().notNull(),
});

export const adminPuesto = pgTable(
  "admin_puesto",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "admin_puesto_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    idCargo: integer("id_cargo").notNull(),
    nombre: varchar({ length: 50 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.idCargo],
      foreignColumns: [administrativoCargo.id],
      name: "admin_puesto_id_cargo_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const cursoGrupo = pgTable(
  "curso_grupo",
  {
    id: serial().primaryKey().notNull(),
    idCurso: integer("id_curso").notNull(),
    idCiclo: integer("id_ciclo").notNull(),
    numero: smallint().notNull(),
    totalMatricula: smallint("total_matricula").default(0),
    retiroMatricula: smallint("retiro_matricula").default(0),
    reprobado0A15: smallint("reprobado_0a1.5").default(0),
    reprobado2A55: smallint("reprobado_2a5.5").default(0),
    reprobado6A65: smallint("reprobado_6a6.5").default(0),
    aprobado7: smallint("aprobado_7").default(0),
    aprobado75A8: smallint("aprobado_7.5a8").default(0),
    aprobado85A10: smallint("aprobado_8.5a10").default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.idCiclo],
      foreignColumns: [ciclo.id],
      name: "curso_grupo_id_ciclo_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.idCurso],
      foreignColumns: [curso.id],
      name: "curso_grupo_id_curso_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const curso = pgTable(
  "curso",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "curso_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    sigla: varchar({ length: 6 }).notNull(),
    nombre: varchar({ length: 100 }).notNull(),
    idDepartamento: integer("id_departamento").notNull(),
    creditaje: smallint(),
    activo: boolean().default(true).notNull(),
    horas: smallint().default(0).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.idDepartamento],
      foreignColumns: [departamento.id],
      name: "curso_id_departamento_fkey",
    }).onDelete("restrict"),
    unique("curso_sigla_unique").on(table.sigla),
    unique("curso_nombre_unique").on(table.nombre),
  ],
);

export const edificio = pgTable(
  "edificio",
  {
    id: varchar({ length: 2 }).primaryKey().notNull(),
    nombre: varchar({ length: 50 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    unique("edificio_nombre_unique").on(table.nombre),
    check(
      "edificio_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const cursoHorario = pgTable(
  "curso_horario",
  {
    idGrupo: integer("id_grupo").notNull(),
    dia: varchar({ length: 1 }).notNull(),
    idEdificio: varchar("id_edificio", { length: 2 }),
    aula: varchar({ length: 3 }),
    horaEntrada: smallint("hora_entrada"),
    horaSalida: smallint("hora_salida"),
  },
  (table) => [
    foreignKey({
      columns: [table.idEdificio],
      foreignColumns: [edificio.id],
      name: "curso_horario_id_edificio_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.idGrupo],
      foreignColumns: [cursoGrupo.id],
      name: "curso_horario_id_grupo_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const departamento = pgTable(
  "departamento",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "departamento_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 100 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    unique("departamento_nombre_unique").on(table.nombre),
    check(
      "departamento_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const proyCentro = pgTable(
  "proy_centro",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "proy_centro_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 100 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    unique("proy_centro_id_key").on(table.id),
    unique("proy_centro_nombre_unique").on(table.nombre),
    check(
      "proy_centro_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const profCategoria = pgTable(
  "prof_categoria",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "prof_categoria_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 50 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
    regimenSalarial: varchar("regimen_salarial", { length: 20 }).notNull(),
  },
  (table) => [
    unique("prof_categoria_nombre_unique").on(table.nombre),
    check(
      "prof_categoria_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
    check(
      "prof_categoria_regimen_salarial_check",
      sql`(regimen_salarial)::text = ANY ((ARRAY['Salario Global'::character varying, 'Antiguo Régimen'::character varying])::text[])`,
    ),
  ],
);

export const proyTipo = pgTable(
  "proy_tipo",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "proy_tipo_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 50 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    unique("proy_tipo_id_key").on(table.id),
    unique("proy_tipo_nombre_unique").on(table.nombre),
    check(
      "proy_tipo_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const profCondicion = pgTable(
  "prof_condicion",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "prof_condicion_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 50 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
    tipo: varchar({ length: 20 }).default("Ordinario").notNull(),
  },
  (table) => [
    unique("prof_condicion_nombre_unique").on(table.nombre),
    check(
      "prof_condicion_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
    check(
      "prof_condicion_tipo_check",
      sql`(tipo)::text = ANY ((ARRAY['Ordinario'::character varying, 'Apoyo docencia'::character varying, 'Licencias sabáticas'::character varying])::text[])`,
    ),
  ],
);

export const proyecto = pgTable(
  "proyecto",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "proyecto_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    codigo: varchar({ length: 20 }),
    idTipo: integer("id_tipo").notNull(),
    idCentro: integer("id_centro"),
    nombre: varchar({ length: 100 }).notNull(),
    descripcion: varchar({ length: 100 }),
    vigenciaInicio: varchar("vigencia_inicio", { length: 10 }),
    vigenciaFin: varchar("vigencia_fin", { length: 10 }),
    activo: boolean().default(true).notNull(),
    refDoc: varchar("ref_doc", { length: 20 }),
  },
  (table) => [
    foreignKey({
      columns: [table.idCentro],
      foreignColumns: [proyCentro.id],
      name: "proyecto_id_centro_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.idTipo],
      foreignColumns: [proyTipo.id],
      name: "proyecto_id_tipo_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    unique("proyecto_id_key").on(table.id),
  ],
);

export const profGrado = pgTable(
  "prof_grado",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "prof_grado_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 50 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    unique("prof_grado_nombre_unique").on(table.nombre),
    check(
      "prof_grado_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const presupuesto = pgTable("presupuesto", {
  id: integer().primaryKey().notNull(),
  descripcion: varchar({ length: 100 }).notNull(),
  orden: smallint(),
});

export const profesor = pgTable(
  "profesor",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "profesor_id_seq1",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    identificacion: varchar({ length: 20 }).notNull(),
    nombre: varchar({ length: 20 }).notNull(),
    apellido1: varchar({ length: 15 }).notNull(),
    apellido2: varchar({ length: 15 }),
    telefono1: varchar({ length: 15 }),
    telefono2: varchar({ length: 15 }),
    telefono3: varchar({ length: 15 }),
    email: varchar({ length: 100 }),
    oficina: varchar({ length: 10 }),
    casillero: varchar({ length: 6 }),
    fechaNombramiento: date("fecha_nombramiento"),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (_table) => [
    check(
      "profesor_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const sistemaVariable = pgTable("sistema_variable", {
  nombre: varchar({ length: 20 }).notNull(),
  descripcion: varchar({ length: 200 }),
  valor: text(),
});

export const administrativoCargo = pgTable(
  "administrativo_cargo",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "administrativo_cargo_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    nombre: varchar({ length: 50 }).notNull(),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    unique("administrativo_cargo_nombre_unique").on(table.nombre),
    check(
      "administrativo_cargo_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);

export const adminNombramiento = pgTable(
  "admin_nombramiento",
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity({
      name: "admin_nombramiento_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
      cache: 1,
    }),
    idProfesor: integer("id_profesor").notNull(),
    idCargo: integer("id_cargo").notNull(),
    idCiclo: integer("id_ciclo").notNull(),
    idPuesto: integer("id_puesto"),
    cargaHoras: smallint("carga_horas").default(0).notNull(),
    refDoc: varchar("ref_doc", { length: 20 }),
    vigenciaInicio: date("vigencia_inicio", { mode: "date" }),
    vigenciaFin: date("vigencia_fin", { mode: "date" }),
  },
  (table) => [
    foreignKey({
      columns: [table.idCargo],
      foreignColumns: [administrativoCargo.id],
      name: "admin_nombramiento_id_cargo_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.idCiclo],
      foreignColumns: [ciclo.id],
      name: "admin_nombramiento_id_ciclo_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.idProfesor],
      foreignColumns: [profesor.id],
      name: "admin_nombramiento_id_profesor_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
    foreignKey({
      columns: [table.idPuesto],
      foreignColumns: [adminPuesto.id],
      name: "admin_nombramiento_id_puesto_fkey",
    })
      .onUpdate("cascade")
      .onDelete("restrict"),
  ],
);

export const presupuestoCiclo = pgTable(
  "presupuesto_ciclo",
  {
    idPresupuesto: integer("id_presupuesto").notNull(),
    idCiclo: integer("id_ciclo").notNull(),
    tcs: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    horas: integer().default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.idPresupuesto, table.idCiclo], name: "presupuesto_ciclo_pkey" }),
  ],
);

export const profJornada = pgTable(
  "prof_jornada",
  {
    idProfesor: integer("id_profesor").notNull(),
    idCiclo: integer("id_ciclo").notNull(),
    idPresupuesto: integer("id_presupuesto").notNull(),
    jornadaHoras: smallint("jornada_horas").default(0).notNull(),
    jornadaTcnum: smallint("jornada_tcnum").default(0).notNull(),
    jornadaTcden: smallint("jornada_tcden").default(1).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.idProfesor],
      foreignColumns: [profesor.id],
      name: "fk_jornada_profesor",
    }),
    foreignKey({
      columns: [table.idCiclo],
      foreignColumns: [ciclo.id],
      name: "fk_jornada_ciclo",
    }),
    foreignKey({
      columns: [table.idPresupuesto],
      foreignColumns: [presupuesto.id],
      name: "fk_jornada_presupuesto",
    }),
    primaryKey({
      columns: [table.idProfesor, table.idCiclo, table.idPresupuesto],
      name: "prof_jornada_pkey",
    }),
  ],
);

export const profEstado = pgTable(
  "prof_estado",
  {
    idProfesor: integer("id_profesor").notNull(),
    idCiclo: integer("id_ciclo").notNull(),
    idCondicion: integer("id_condicion"),
    idGrado: integer("id_grado"),
    idCategoria: integer("id_categoria"),
    especialidad: varchar({ length: 50 }),
    titulo1: varchar({ length: 100 }),
    otroTrabajo: varchar("otro_trabajo", { length: 50 }),
    titulo2: varchar({ length: 100 }),
    otraInfo: varchar("otra_info", { length: 100 }),
    estado: varchar({ length: 10 }).default("Activo").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.idCondicion],
      foreignColumns: [profCondicion.id],
      name: "prof_estado_id_condicion_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.idGrado],
      foreignColumns: [profGrado.id],
      name: "prof_estado_id_grado_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.idCategoria],
      foreignColumns: [profCategoria.id],
      name: "prof_estado_id_categoria_fkey",
    }).onDelete("restrict"),
    primaryKey({ columns: [table.idProfesor, table.idCiclo], name: "prof_estado_pkey" }),
    check(
      "prof_estado_estado_check",
      sql`(estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying])::text[])`,
    ),
  ],
);
