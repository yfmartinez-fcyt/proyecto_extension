from django.core.management.base import BaseCommand, CommandError

from apps.usuarios.models import Usuario
from apps.usuarios.user_ops import crear_usuario


class Command(BaseCommand):
    help = "Crea un usuario de login en usuarios_django (alumno, docente, director_extension, admin)."

    def add_arguments(self, parser):
        parser.add_argument("--email", required=True, help="Correo institucional (login)")
        parser.add_argument("--password", required=True, help="Contraseña en texto plano (se hashea)")
        parser.add_argument(
            "--rol",
            default="alumno",
            choices=[c[0] for c in Usuario.ROLES],
            help="Rol del usuario",
        )
        parser.add_argument("--username", default=None, help="Opcional; si no se indica, se deduce del correo")
        parser.add_argument("--first-name", default="", dest="first_name")
        parser.add_argument("--last-name", default="", dest="last_name")
        parser.add_argument("--staff", action="store_true", help="is_staff=True")
        parser.add_argument("--superuser", action="store_true", help="is_superuser=True")

    def handle(self, *args, **options):
        try:
            user = crear_usuario(
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

        self.stdout.write(self.style.SUCCESS(f"Usuario creado: {user.email} (rol={user.rol})"))
        self.stdout.write(f"  Username: {user.username}")
        if user.rol == "director_extension":
            self.stdout.write("  Tras login irá a: /proyectos/director/")
