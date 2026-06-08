"""Operaciones compartidas para alta de usuarios (admin, comando, shell, SQL)."""

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone

Usuario = get_user_model()

ROLES_VALIDOS = {choice[0] for choice in Usuario.ROLES}


def _username_desde_email(email: str) -> str:
    base = email.split("@")[0].lower()
    if Usuario.objects.filter(username=base).exists():
        dominio = email.split("@")[-1].split(".")[0][:8]
        candidato = f"{base}_{dominio}"
        if not Usuario.objects.filter(username=candidato).exists():
            return candidato[:150]
        n = 2
        while Usuario.objects.filter(username=f"{base}{n}").exists():
            n += 1
        return f"{base}{n}"[:150]
    return base[:150]


def crear_usuario(
    *,
    email: str,
    password: str,
    username: str | None = None,
    rol: str = "alumno",
    first_name: str = "",
    last_name: str = "",
    is_staff: bool = False,
    is_superuser: bool = False,
    is_active: bool = True,
):
    """
    Crea un usuario en usuarios_django con contraseña hasheada.
    Usado por el comando manage.py, el shell y puede replicarse vía SQL generado.
    """
    email = email.strip().lower()
    if not email:
        raise ValueError("El correo es obligatorio.")
    if rol not in ROLES_VALIDOS:
        raise ValueError(f"Rol inválido. Opciones: {', '.join(sorted(ROLES_VALIDOS))}")
    if Usuario.objects.filter(email__iexact=email).exists():
        raise ValueError(f"Ya existe un usuario con el correo {email}.")

    username = (username or _username_desde_email(email)).strip()
    if Usuario.objects.filter(username=username).exists():
        raise ValueError(f"Ya existe un usuario con username '{username}'.")

    return Usuario.objects.create_user(
        username=username,
        email=email,
        password=password,
        rol=rol,
        first_name=first_name,
        last_name=last_name,
        is_staff=is_staff,
        is_superuser=is_superuser,
        is_active=is_active,
    )


def generar_sql_insert(
    *,
    email: str,
    password: str,
    username: str | None = None,
    rol: str = "alumno",
    first_name: str = "",
    last_name: str = "",
    is_staff: bool = False,
    is_superuser: bool = False,
    is_active: bool = True,
) -> str:
    """
    Genera un INSERT para usuarios_django con password hasheado (PBKDF2 de Django).
    No ejecuta el SQL; solo lo devuelve para pegarlo en pgAdmin/psql.
    """
    email = email.strip().lower()
    if not email:
        raise ValueError("El correo es obligatorio.")
    if rol not in ROLES_VALIDOS:
        raise ValueError(f"Rol inválido. Opciones: {', '.join(sorted(ROLES_VALIDOS))}")

    username = (username or _username_desde_email(email)).strip()
    password_hash = make_password(password)
    ahora = timezone.now().strftime("%Y-%m-%d %H:%M:%S%z")

    def esc(val: str) -> str:
        return val.replace("'", "''")

    return f"""INSERT INTO usuarios_django (
    password,
    is_superuser,
    username,
    first_name,
    last_name,
    is_staff,
    is_active,
    date_joined,
    email,
    rol
) VALUES (
    '{esc(password_hash)}',
    {'true' if is_superuser else 'false'},
    '{esc(username)}',
    '{esc(first_name)}',
    '{esc(last_name)}',
    {'true' if is_staff else 'false'},
    {'true' if is_active else 'false'},
    '{ahora}',
    '{esc(email)}',
    '{esc(rol)}'
);
-- Login: correo '{email}' o username '{username}'
"""
