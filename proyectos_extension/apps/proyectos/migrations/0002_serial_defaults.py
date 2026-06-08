from django.db import migrations


SQL_CRONOGRAMA_SEQUENCE = """
CREATE SEQUENCE IF NOT EXISTS cronograma_idCronograma_seq;

ALTER TABLE cronograma
    ALTER COLUMN "idCronograma" SET DEFAULT nextval('cronograma_idCronograma_seq');

SELECT setval(
    'cronograma_idCronograma_seq',
    COALESCE((SELECT MAX("idCronograma") FROM cronograma), 0) + 1,
    false
);
"""


class Migration(migrations.Migration):

    dependencies = [
        ("proyectos", "0001_bridge_legacy_db"),
    ]

    operations = [
        migrations.RunSQL(SQL_CRONOGRAMA_SEQUENCE, migrations.RunSQL.noop),
    ]
