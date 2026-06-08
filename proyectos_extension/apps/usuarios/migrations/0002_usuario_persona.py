from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("usuarios", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelTable(
            name="usuario",
            table="usuarios_django",
        ),
        migrations.RunSQL(
            """
            ALTER TABLE usuarios_django
            ADD COLUMN IF NOT EXISTS "idPersona" integer
                REFERENCES personas("idPersona") ON DELETE SET NULL;
            """,
            migrations.RunSQL.noop,
        ),
    ]
