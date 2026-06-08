from django.contrib import admin

from .models import Proyecto, ProyectoRevision


@admin.register(Proyecto)
class ProyectoAdmin(admin.ModelAdmin):
    list_display = ("idProyecto", "denominacion", "estado", "proponente", "fecha_inicio")
    list_filter = ("estado",)
    search_fields = ("denominacion", "proponente__nombre", "proponente__apellido")
    readonly_fields = ("idProyecto",)


@admin.register(ProyectoRevision)
class ProyectoRevisionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "proyecto",
        "accion",
        "estado_nuevo",
        "director",
        "creado_en",
    )
    list_filter = ("accion", "estado_nuevo")
    search_fields = ("proyecto__denominacion", "comentario")
    readonly_fields = ("id", "creado_en")
