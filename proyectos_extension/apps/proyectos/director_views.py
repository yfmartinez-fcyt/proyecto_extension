"""
Vistas del portal del Director de Extensión.

Responsabilidad de cada vista:
  - verificar rol (decorador),
  - leer parámetros HTTP,
  - delegar en ``director_services``,
  - renderizar plantillas bajo ``templates/director/``.

Sin consultas ORM ni reglas de negocio aquí.
"""

from django.contrib import messages
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from apps.proyectos.constants import AccionDirector
from apps.proyectos.decorators import rol_requerido
from apps.proyectos.director_services import (
    ErrorRevisionProyecto,
    construir_contexto_revision,
    contar_proyectos_pendientes,
    ejecutar_revision_director,
    listar_proyectos_pendientes,
    obtener_proyecto_para_revision,
)


@rol_requerido("director_extension")
def dashboard_director(request):
    """Panel principal: bandeja de proyectos pendientes de dictamen."""
    proyectos = listar_proyectos_pendientes()
    return render(
        request,
        "director/dashboard.html",
        {
            "proyectos": proyectos,
            "total_pendientes": contar_proyectos_pendientes(),
        },
    )


@rol_requerido("director_extension")
def revision_detalle(request, id):
    """Lectura completa de la propuesta enviada por el proponente."""
    proyecto = obtener_proyecto_para_revision(id)
    if not proyecto:
        messages.error(
            request,
            "Este proyecto no está pendiente de revisión o ya fue dictaminado.",
        )
        return redirect("dashboard_director")

    contexto = construir_contexto_revision(proyecto)
    contexto["acciones"] = AccionDirector.CHOICES
    return render(request, "director/revision_detalle.html", contexto)


@rol_requerido("director_extension")
@require_POST
def revision_accion(request, id):
    """Ejecuta aprobar, rechazar u observar según el formulario POST."""
    accion = (request.POST.get("accion") or "").strip()
    comentario = request.POST.get("comentario", "")

    try:
        _, _, estado_nuevo = ejecutar_revision_director(
            id, request.user, accion, comentario
        )
    except ErrorRevisionProyecto as exc:
        messages.error(request, str(exc))
        return redirect("director_revision_detalle", id=id)

    mensajes_exito = {
        AccionDirector.APROBAR: "Proyecto aprobado. Ya puede publicarse en el repositorio.",
        AccionDirector.RECHAZAR: "Proyecto rechazado. Se notificó al proponente mediante el historial.",
        AccionDirector.OBSERVAR: "Observaciones registradas. El proponente podrá corregir y reenviar.",
    }
    messages.success(
        request,
        mensajes_exito.get(
            accion,
            f"Revisión registrada. Estado actual: {estado_nuevo}.",
        ),
    )
    return redirect("dashboard_director")
