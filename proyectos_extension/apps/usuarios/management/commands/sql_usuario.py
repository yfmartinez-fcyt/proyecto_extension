from django.core.management.base import BaseCommand, CommandError

from apps.usuarios.models import Usuario
from apps.usuarios.user_ops import generar_sql_insert


class Command(BaseCommand):
    help = "Genera INSERT SQL para usuarios_django con contraseña hasheada (pegar en pgAdmin)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument(
            "--rol",
            default="alumno",
            choices=[c[0] for c in Usuario.ROLES],
        )
        parser.add_argument("--username", default=None)
        parser.add_argument("--first-name", default="", dest="first_name")
        parser.add_argument("--last-name", default="", dest="last_name")
        parser.add_argument("--staff", action="store_true")
        parser.add_argument("--superuser", action="store_true")

    def handle(self, *args, **options):
        try:
            sql = generar_sql_insert(
                email=options["email"],
                password=options["password"],
                username=options["username"],
                rol=options["rol"],
                first_name=options["first_name"],
                last_name=options["last_name"],
                is_staff=options["staff"],
                is_superuser=options["superuser"],
            )
        except ValueError as exc:
            raise CommandError(str(exc)) from exc

        self.stdout.write(sql)
