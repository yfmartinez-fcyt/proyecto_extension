from django.db import migrations


SQL_CREAR_REVISIONES = """
CREATE TABLE IF NOT EXISTS proyecto_revisiones (
    id serial PRIMARY KEY,
    "idProyecto" integer NOT NULL
        REFERENCES proyectos("idProyecto") ON DELETE CASCADE,
    "idUsuarioDirector" integer
        REFERENCES usuarios_django(id) ON DELETE SET NULL,
    accion varchar(30) NOT NULL,
    comentario text,
    "estadoAnterior" varchar(45),
    "estadoNuevo" varchar(45),
    "creadoEn" timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proyecto_revisiones_proyecto
    ON proyecto_revisiones ("idProyecto");

CREATE INDEX IF NOT EXISTS idx_proyecto_revisiones_creado
    ON proyecto_revisiones ("creadoEn" DESC);
"""


class Migration(migrations.Migration):

    dependencies = [
        ("proyectos", "0002_serial_defaults"),
        ("usuarios", "0002_usuario_persona"),
    ]

    operations = [
        migrations.RunSQL(SQL_CREAR_REVISIONES, migrations.RunSQL.noop),
    ]
