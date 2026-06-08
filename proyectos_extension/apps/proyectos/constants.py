"""Constantes de dominio para proyectos (usar en modelos y vistas)."""


class EstadoProyecto:
    BORRADOR = "borrador"
    PENDIENTE = "pendiente"
    APROBADO = "aprobado"
    SUGERENCIAS = "sugerencias"
    RECHAZADO = "rechazado"

    CHOICES = [
        (BORRADOR, "Borrador"),
        (PENDIENTE, "Pendiente"),
        (APROBADO, "Aprobado"),
        (SUGERENCIAS, "Con sugerencias"),
        (RECHAZADO, "Rechazado"),
    ]

    EDITABLES = (BORRADOR, PENDIENTE, SUGERENCIAS)

    # Estados que el director puede resolver desde su bandeja
    REVISABLES_DIRECTOR = (PENDIENTE,)

    ETIQUETAS = {
        BORRADOR: "Borrador",
        PENDIENTE: "Pendiente de revisión",
        APROBADO: "Aprobado",
        SUGERENCIAS: "Con sugerencias",
        RECHAZADO: "Rechazado",
    }


class AccionDirector:
    """Acciones que el Director de Extensión ejecuta sobre un proyecto."""

    APROBAR = "aprobar"
    RECHAZAR = "rechazar"
    OBSERVAR = "observar"

    CHOICES = [
        (APROBAR, "Aprobar"),
        (RECHAZAR, "Rechazar"),
        (OBSERVAR, "Observar (sugerencias)"),
    ]

    # Mapeo acción → nuevo estado del proyecto
    ESTADO_DESTINO = {
        APROBAR: EstadoProyecto.APROBADO,
        RECHAZAR: EstadoProyecto.RECHAZADO,
        OBSERVAR: EstadoProyecto.SUGERENCIAS,
    }

    # Acciones que exigen comentario institucional obligatorio
    REQUIERE_COMENTARIO = (RECHAZAR, OBSERVAR)
