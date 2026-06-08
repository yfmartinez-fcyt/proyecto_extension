"""Datos de demostración. Eliminar cuando exista el modelo Proyecto en BD."""

from .constants import EstadoProyecto

PROYECTOS_REPOSITORIO = [
    {
        "id": 1,
        "titulo": "Sistema de Gestión Educativa",
        "fecha": "15/03/2026",
        "resumen": "Plataforma para administrar cursos y estudiantes.",
        "descripcion": "Sistema completo para gestionar alumnos, docentes y cursos.",
    },
    {
        "id": 2,
        "titulo": "App de Salud Comunitaria",
        "fecha": "02/04/2026",
        "resumen": "Aplicación para monitoreo de pacientes rurales.",
        "descripcion": "Aplicación para seguimiento de pacientes en zonas rurales.",
    },
    {
        "id": 3,
        "titulo": "Portal de Extensión Universitaria",
        "fecha": "10/04/2026",
        "resumen": "Sistema web para gestión de proyectos.",
        "descripcion": "Plataforma institucional para gestión de proyectos.",
    },
]

PROYECTOS_USUARIO_DEMO = [
    {
        "titulo": "Sistema Web de Biblioteca",
        "estado": EstadoProyecto.APROBADO,
        "fecha": "2026-04-01",
    },
    {
        "titulo": "Aplicación Móvil de Salud",
        "estado": EstadoProyecto.APROBADO,
        "fecha": "2026-04-02",
    },
    {
        "titulo": "Sistema de Inventario",
        "estado": EstadoProyecto.PENDIENTE,
        "fecha": "2026-04-03",
    },
    {
        "titulo": "Plataforma Educativa",
        "estado": EstadoProyecto.SUGERENCIAS,
        "fecha": "2026-04-04",
        "comentario": "Mejorar la justificación del impacto social.",
    },
    {
        "titulo": "Sistema Contable",
        "estado": EstadoProyecto.BORRADOR,
        "fecha": "2026-04-05",
    },
    {
        "titulo": "App de Delivery",
        "estado": EstadoProyecto.RECHAZADO,
        "fecha": "2026-04-06",
        "comentario": "El proyecto no cumple con los requisitos mínimos.",
    },
]
