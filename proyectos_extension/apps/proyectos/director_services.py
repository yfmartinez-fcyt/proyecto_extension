"""
Servicios del Director de Extensión.

Toda la lógica institucional de revisión vive aquí (no en views.py):
  - bandeja de proyectos pendientes,
  - lectura completa de la propuesta del proponente,
  - aprobar / rechazar / observar con comentarios,
  - historial auditable de cada decisión.

Flujo institucional:
  El proponente envía → estado ``pendiente``.
  El director revisa y registra una acción → ``aprobado``, ``rechazado`` o ``sugerencias``.
  Cada cambio queda en ``proyecto_revisiones`` para trazabilidad.
"""

from django.db import transaction
from django.utils import timezone

from apps.proyectos.constants import AccionDirector, EstadoProyecto
from apps.proyectos.models import Cronograma, Presupuesto, Proyecto, ProyectoRevision
from apps.proyectos.services import obtener_initial_formulario


class ErrorRevisionProyecto(Exception):
    """Error de validación o de negocio al revisar un proyecto."""


# ---------------------------------------------------------------------------
# Consultas para el panel del director
# ---------------------------------------------------------------------------


def listar_proyectos_pendientes():
    """
    Bandeja institucional: solo propuestas en espera de dictamen.
    El director no debe ver borradores ni proyectos ya resueltos aquí.
    """
    return (
        Proyecto.objects.select_related("proponente", "sublinea", "sublinea__linea_accion", "usuario")
        .filter(estado__in=EstadoProyecto.REVISABLES_DIRECTOR)
        .order_by("-actualizado_en", "-idProyecto")
    )


def contar_proyectos_pendientes():
    """Contador para el encabezado del dashboard."""
    return Proyecto.objects.filter(estado__in=EstadoProyecto.REVISABLES_DIRECTOR).count()


def obtener_proyecto_para_revision(proyecto_id):
    """
    Carga un proyecto que el director puede dictaminar.
    Solo se permiten estados en ``REVISABLES_DIRECTOR`` (hoy: ``pendiente``).
    """
    return (
        Proyecto.objects.select_related(
            "proponente",
            "proponente__tipo",
            "sublinea",
            "sublinea__linea_accion",
            "usuario",
        )
        .prefetch_related("unidades_academicas", "revisiones__director")
        .filter(
            pk=proyecto_id,
            estado__in=EstadoProyecto.REVISABLES_DIRECTOR,
        )
        .first()
    )


def _formatear_persona(persona):
    if not persona:
        return "—"
    nombre = f"{persona.nombre or ''} {persona.apellido or ''}".strip()
    return nombre or persona.correo or "—"


def _cronograma_filas(proyecto_id):
    filas = []
    for item in (
        Cronograma.objects.filter(proyecto_id=proyecto_id)
        .select_related("actividad")
        .order_by("idCronograma")
    ):
        filas.append(
            {
                "actividad": (item.actividad.nombre if item.actividad else "—"),
                "fecha_inicio": item.fecha_inicio.isoformat() if item.fecha_inicio else "",
                "fecha_fin": item.fecha_fin.isoformat() if item.fecha_fin else "",
                "dias": item.cantidad_dias,
                "horas": item.horas_extension,
            }
        )
    return filas


def construir_contexto_revision(proyecto):
    """
    Arma el contexto de solo lectura para la pantalla de revisión.
    Reutiliza ``obtener_initial_formulario`` para no duplicar el mapeo
    de campos del formulario del proponente.
    """
    initial = obtener_initial_formulario(proyecto)
    proponente = proyecto.proponente
    sublinea = proyecto.sublinea
    linea = sublinea.linea_accion if sublinea else None

    presupuesto = (
        Presupuesto.objects.filter(proyecto_id=proyecto.idProyecto)
        .order_by("idPresupuesto")
        .first()
    )

    return {
        "proyecto": proyecto,
        "id": proyecto.idProyecto,
        "titulo": proyecto.denominacion or f"Proyecto #{proyecto.idProyecto}",
        "estado": proyecto.estado,
        "estado_etiqueta": EstadoProyecto.ETIQUETAS.get(
            proyecto.estado, proyecto.estado
        ),
        "fecha_envio": proyecto.actualizado_en,
        "proponente_nombre": _formatear_persona(proponente),
        "proponente_correo": proponente.correo if proponente else "",
        "proponente_tipo": (
            proponente.tipo.tipo_persona if proponente and proponente.tipo else ""
        ),
        "cuenta_django": (
            proyecto.usuario.get_full_name() or proyecto.usuario.username
            if proyecto.usuario
            else ""
        ),
        "linea": linea.linea if linea else "",
        "sublinea": sublinea.sublinea if sublinea else "",
        "unidades": [ua.nombre for ua in proyecto.unidades_academicas.all()],
        "initial": initial,
        "presupuesto": presupuesto.descripcion if presupuesto else "",
        "cronograma": _cronograma_filas(proyecto.idProyecto),
        "historial": historial_revisiones(proyecto.idProyecto),
    }


def historial_revisiones(proyecto_id, limite=None):
    """
    Registro cronológico de dictámenes previos (útil si el alumno reenvía).
    """
    qs = (
        ProyectoRevision.objects.filter(proyecto_id=proyecto_id)
        .select_related("director")
        .order_by("-creado_en", "-id")
    )
    if limite:
        qs = qs[:limite]

    items = []
    for rev in qs:
        director = rev.director
        items.append(
            {
                "id": rev.id,
                "accion": rev.accion,
                "accion_etiqueta": dict(AccionDirector.CHOICES).get(
                    rev.accion, rev.accion
                ),
                "comentario": rev.comentario or "",
                "estado_anterior": rev.estado_anterior,
                "estado_nuevo": rev.estado_nuevo,
                "estado_nuevo_etiqueta": EstadoProyecto.ETIQUETAS.get(
                    rev.estado_nuevo, rev.estado_nuevo
                ),
                "director": (
                    director.get_full_name() or director.username if director else "—"
                ),
                "fecha": rev.creado_en,
            }
        )
    return items


def ultima_revision_proyecto(proyecto_id):
    """Último dictamen registrado (para mostrar feedback al proponente)."""
    historial = historial_revisiones(proyecto_id, limite=1)
    return historial[0] if historial else None


# ---------------------------------------------------------------------------
# Acciones institucionales del director
# ---------------------------------------------------------------------------


def _validar_accion(accion, comentario):
    if accion not in AccionDirector.ESTADO_DESTINO:
        raise ErrorRevisionProyecto("Acción de revisión no válida.")

    comentario = (comentario or "").strip()
    if accion in AccionDirector.REQUIERE_COMENTARIO and not comentario:
        raise ErrorRevisionProyecto(
            "Debe indicar un comentario institucional para rechazar u observar el proyecto."
        )
    if len(comentario) > 5000:
        raise ErrorRevisionProyecto("El comentario no puede superar los 5000 caracteres.")
    return comentario


@transaction.atomic
def ejecutar_revision_director(proyecto_id, director, accion, comentario=""):
    """
    Transición de estado + registro en historial (operación atómica).

    Flujo:
      1. Verificar que el proyecto sigue ``pendiente``.
      2. Validar acción y comentario.
      3. Actualizar ``proyectos.estado``.
      4. Insertar fila en ``proyecto_revisiones``.
    """
    proyecto = (
        Proyecto.objects.select_for_update()
        .filter(
            pk=proyecto_id,
            estado__in=EstadoProyecto.REVISABLES_DIRECTOR,
        )
        .first()
    )
    if not proyecto:
        raise ErrorRevisionProyecto(
            "El proyecto no está disponible para revisión o ya fue dictaminado."
        )

    comentario = _validar_accion(accion, comentario)
    estado_anterior = proyecto.estado or EstadoProyecto.PENDIENTE
    estado_nuevo = AccionDirector.ESTADO_DESTINO[accion]
    ahora = timezone.now()

    proyecto.estado = estado_nuevo
    proyecto.actualizado_en = ahora
    proyecto.save(update_fields=["estado", "actualizado_en"])

    revision = ProyectoRevision(
        proyecto_id=proyecto.idProyecto,
        director_id=director.id if director else None,
        accion=accion,
        comentario=comentario,
        estado_anterior=estado_anterior,
        estado_nuevo=estado_nuevo,
        creado_en=ahora,
    )
    revision.save(force_insert=True)

    return proyecto, revision, estado_nuevo
