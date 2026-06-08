from django.urls import path

from .director_views import (
    dashboard_director,
    revision_accion,
    revision_detalle,
)
from .views import (
    detalle_proyecto,
    editar_proyecto,
    eliminar_proyecto,
    mis_proyectos,
    nuevo_proyecto,
    proyectos_aprobados,
)

urlpatterns = [
    # Portal del proponente (alumno / docente)
    path("mis-proyectos/", mis_proyectos, name="mis_proyectos"),
    path("nuevo/", nuevo_proyecto, name="nuevo_proyecto"),
    path("editar/<int:id>/", editar_proyecto, name="editar_proyecto"),
    path("eliminar/<int:id>/", eliminar_proyecto, name="eliminar_proyecto"),
    # Repositorio público de aprobados
    path("repositorio-proyectos/", proyectos_aprobados, name="repositorio_proyectos"),
    path("detalle-proyecto/<int:id>/", detalle_proyecto, name="detalle_proyecto"),
    # Portal del Director de Extensión (interfaz separada)
    path("director/", dashboard_director, name="dashboard_director"),
    path(
        "director/revision/<int:id>/",
        revision_detalle,
        name="director_revision_detalle",
    ),
    path(
        "director/revision/<int:id>/accion/",
        revision_accion,
        name="director_revision_accion",
    ),
]
