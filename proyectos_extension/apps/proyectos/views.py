from django.contrib import messages
from django.http import Http404
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from apps.core.catalog import obtener_catalogo_formulario
from apps.proyectos.constants import EstadoProyecto
from apps.proyectos.models import Proyecto
from apps.proyectos.decorators import solo_proponente
from apps.proyectos.director_services import ultima_revision_proyecto
from apps.proyectos.services import (
    ErrorGuardadoProyecto,
    eliminar_proyecto_de_usuario,
    guardar_proyecto_desde_formulario,
    obtener_initial_formulario,
    obtener_proyecto_editable,
)


def _contexto_formulario_proyecto(proyecto=None):
    catalogo = obtener_catalogo_formulario()
    ctx = {
        "catalogo": catalogo,
        "lineas": catalogo["lineas"],
        "unidades_academicas": catalogo["unidades"],
        "modo": "editar" if proyecto else "crear",
        "proyecto_id": proyecto.idProyecto if proyecto else None,
        "initial": obtener_initial_formulario(proyecto) if proyecto else {},
    }
    if proyecto:
        ctx["estado_proyecto"] = proyecto.estado
        ctx["titulo_hero"] = "Editar proyecto"
        ctx["subtitulo_hero"] = (
            "Actualice su propuesta y guarde los cambios o reenvíela para revisión."
        )
    else:
        ctx["titulo_hero"] = "Formulario de Programa, Proyecto o Actividad"
        ctx["subtitulo_hero"] = (
            "Complete este formulario con la información requerida para la evaluación "
            "de su propuesta académica."
        )
    return ctx


def _procesar_guardado_formulario(request, proyecto_id=None):
    accion = request.POST.get("accion", EstadoProyecto.BORRADOR)
    if proyecto_id is None:
        proyecto_id = request.POST.get("proyecto_id") or None
        if proyecto_id:
            try:
                proyecto_id = int(proyecto_id)
            except (TypeError, ValueError):
                proyecto_id = None

    try:
        _, estado = guardar_proyecto_desde_formulario(
            request.POST, request.user, accion, proyecto_id=proyecto_id
        )
    except ErrorGuardadoProyecto as exc:
        messages.error(request, str(exc))
        proyecto = obtener_proyecto_editable(proyecto_id, request.user) if proyecto_id else None
        return render(
            request,
            "proyectos/nuevo_proyecto.html",
            _contexto_formulario_proyecto(proyecto),
        )
    except Exception:
        messages.error(
            request,
            "No se pudo guardar el proyecto. Verifique los datos e intente nuevamente.",
        )
        proyecto = obtener_proyecto_editable(proyecto_id, request.user) if proyecto_id else None
        return render(
            request,
            "proyectos/nuevo_proyecto.html",
            _contexto_formulario_proyecto(proyecto),
        )

    if proyecto_id:
        if estado == EstadoProyecto.PENDIENTE:
            messages.success(request, "Proyecto actualizado y reenviado para revisión.")
        else:
            messages.success(request, "Cambios guardados correctamente.")
    elif estado == EstadoProyecto.PENDIENTE:
        messages.success(request, "Proyecto enviado para revisión.")
    else:
        messages.success(request, "Borrador guardado correctamente.")

    return redirect("mis_proyectos")


def proyectos_aprobados(request):
    query = request.GET.get("q", "").strip()
    proyectos_qs = Proyecto.objects.filter(estado=EstadoProyecto.APROBADO).select_related(
        "sublinea", "proponente"
    )

    proyectos = [
        {
            "id": p.id,
            "titulo": p.denominacion,
            "fecha": p.fecha_inicio.strftime("%d/%m/%Y") if p.fecha_inicio else "",
            "resumen": (p.fundamentacion or "")[:160],
        }
        for p in proyectos_qs
    ]

    if query:
        query_lower = query.lower()
        proyectos = [
            p
            for p in proyectos
            if query_lower in p["titulo"].lower() or query in p["fecha"]
        ]

    return render(
        request,
        "proyectos/repositorio_proyectos.html",
        {"proyectos": proyectos, "query": query},
    )


def detalle_proyecto(request, id):
    proyecto = (
        Proyecto.objects.select_related("sublinea", "proponente")
        .filter(pk=id, estado=EstadoProyecto.APROBADO)
        .first()
    )

    if not proyecto:
        raise Http404("Proyecto no encontrado")

    contexto = {
        "id": proyecto.id,
        "titulo": proyecto.denominacion,
        "fecha": proyecto.fecha_inicio.strftime("%d/%m/%Y") if proyecto.fecha_inicio else "",
        "descripcion": proyecto.fundamentacion or proyecto.objetivos_especificos or "",
    }

    return render(request, "proyectos/detalle_repositorio.html", {"proyecto": contexto})


@solo_proponente
def mis_proyectos(request):
    proyectos_db = (
        Proyecto.objects.filter(usuario_id=request.user.id)
        .select_related("sublinea")
        .order_by("-actualizado_en", "-idProyecto")
    )

    proyectos = []
    for p in proyectos_db:
        ultima = None
        if p.estado in (EstadoProyecto.SUGERENCIAS, EstadoProyecto.RECHAZADO):
            ultima = ultima_revision_proyecto(p.idProyecto)

        item = {
            "id": p.idProyecto,
            "titulo": p.denominacion or f"Proyecto #{p.idProyecto}",
            "estado": p.estado or EstadoProyecto.BORRADOR,
            "fecha": p.fecha_inicio.isoformat() if p.fecha_inicio else "",
            "puede_editar": p.estado in EstadoProyecto.EDITABLES,
            "comentario_director": ultima["comentario"] if ultima else "",
        }
        proyectos.append(item)

    return render(request, "proyectos/mis_proyectos.html", {"proyectos": proyectos})


@solo_proponente
def nuevo_proyecto(request):
    if request.method == "POST":
        return _procesar_guardado_formulario(request)
    return render(
        request,
        "proyectos/nuevo_proyecto.html",
        _contexto_formulario_proyecto(),
    )


@solo_proponente
def editar_proyecto(request, id):
    proyecto = obtener_proyecto_editable(id, request.user)
    if not proyecto:
        messages.error(
            request,
            "Este proyecto no puede editarse (aprobado, rechazado o no le pertenece).",
        )
        return redirect("mis_proyectos")

    if request.method == "POST":
        return _procesar_guardado_formulario(request, proyecto_id=id)

    return render(
        request,
        "proyectos/nuevo_proyecto.html",
        _contexto_formulario_proyecto(proyecto),
    )


@solo_proponente
@require_POST
def eliminar_proyecto(request, id):
    try:
        eliminar_proyecto_de_usuario(id, request.user)
    except ErrorGuardadoProyecto as exc:
        messages.error(request, str(exc))
    else:
        messages.success(request, "Proyecto eliminado correctamente.")
    return redirect("mis_proyectos")