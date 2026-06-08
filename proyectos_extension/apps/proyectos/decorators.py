"""
Decoradores de acceso por rol.

Centralizan la protección institucional para no repetir
`if request.user.rol` en cada vista.
"""

from functools import wraps

from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect


def rol_requerido(*roles):
    """
    Solo permite acceso a usuarios autenticados con uno de los roles indicados.
    Uso típico: @rol_requerido("director_extension")
    """

    def decorator(view_func):
        @login_required
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if getattr(request.user, "rol", None) not in roles:
                return redirect("inicio")
            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator


def solo_proponente(view_func):
    """
    Impide que el Director de Extensión use el portal del proponente
    (nuevo proyecto, mis proyectos, etc.) y lo envía a su panel.
    """

    @login_required
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if getattr(request.user, "rol", None) == "director_extension":
            return redirect("dashboard_director")
        return view_func(request, *args, **kwargs)

    return wrapper
