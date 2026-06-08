from django.db import migrations


SQL_BRIDGE = """
ALTER TABLE lineas_accion
    ALTER COLUMN linea TYPE varchar(120);

ALTER TABLE proyectos
    ALTER COLUMN denominacion TYPE varchar(255);

ALTER TABLE proyectos
    ALTER COLUMN "objGeneral" TYPE varchar(255);

ALTER TABLE proyectos
    ALTER COLUMN metodologia TYPE text;

ALTER TABLE presupuestos
    ALTER COLUMN descripcion TYPE text;

ALTER TABLE personas
    ALTER COLUMN nombre TYPE varchar(80);

ALTER TABLE personas
    ALTER COLUMN apellido TYPE varchar(80);

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS "horasAsignadas" integer;

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS curso varchar(80);

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS "carreraTexto" varchar(120);

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS "proponenteActividad" varchar(120);

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS "idUsuarioDjango" integer;

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS "creadoEn" timestamp with time zone;

ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS "actualizadoEn" timestamp with time zone;

CREATE TABLE IF NOT EXISTS proyecto_unidades_academicas (
    id serial PRIMARY KEY,
    "idProyecto" integer NOT NULL
        REFERENCES proyectos("idProyecto") ON DELETE CASCADE,
    nombre varchar(200) NOT NULL
);
"""


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.RunSQL(SQL_BRIDGE, migrations.RunSQL.noop),
    ]
