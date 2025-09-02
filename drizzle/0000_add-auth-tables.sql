CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ciclo" (
	"id" integer PRIMARY KEY NOT NULL,
	"periodo" smallint NOT NULL,
	"anno" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curso_grupo" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_curso" integer NOT NULL,
	"id_ciclo" integer NOT NULL,
	"numero" smallint NOT NULL,
	"total_matricula" smallint DEFAULT 0,
	CONSTRAINT "curso_grupo_id_curso_id_ciclo_numero_key" UNIQUE("id_curso","id_ciclo","numero")
);
--> statement-breakpoint
CREATE TABLE "curso_horario" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_grupo" integer NOT NULL,
	"dia" varchar(1) NOT NULL,
	"id_edificio" varchar(2),
	"aula" varchar(3),
	"hora_entrada" smallint,
	"hora_salida" smallint
);
--> statement-breakpoint
CREATE TABLE "curso" (
	"id" serial PRIMARY KEY NOT NULL,
	"sigla" varchar(6) NOT NULL,
	"nombre" varchar(100) NOT NULL,
	"id_departamento" integer NOT NULL,
	"creditaje" smallint,
	"activo" boolean DEFAULT true NOT NULL,
	"horas" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departamento" (
	"id" integer PRIMARY KEY NOT NULL,
	"nombre" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edificio" (
	"id" varchar(2) PRIMARY KEY NOT NULL,
	"nombre" varchar(50) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curso_grupo" ADD CONSTRAINT "curso_grupo_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "public"."curso"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "curso_grupo" ADD CONSTRAINT "curso_grupo_id_ciclo_fkey" FOREIGN KEY ("id_ciclo") REFERENCES "public"."ciclo"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "curso_horario" ADD CONSTRAINT "curso_horario_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "public"."curso_grupo"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "curso_horario" ADD CONSTRAINT "curso_horario_id_edificio_fkey" FOREIGN KEY ("id_edificio") REFERENCES "public"."edificio"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "curso" ADD CONSTRAINT "curso_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "public"."departamento"("id") ON DELETE restrict ON UPDATE cascade;