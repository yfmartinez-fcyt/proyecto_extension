from django.urls import path
from django.views.generic import RedirectView

from .views import inicio, lineas_accion, soporte_tecnico

urlpatterns = [
    path("", inicio, name="inicio"),
    path("lineas-de-accion/", lineas_accion, name="lineas_accion"),
    path("soporte-tecnico/", soporte_tecnico, name="soporte_tecnico"),
    # Compatibilidad con enlaces antiguos
    path(
        "repositorio-proyectos/",
        RedirectView.as_view(url="/proyectos/repositorio-proyectos/", permanent=False),
    ),
]
