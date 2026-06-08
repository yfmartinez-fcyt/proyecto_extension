from django.contrib import admin

from .models import Evidencia, Informe


@admin.register(Informe)
class InformeAdmin(admin.ModelAdmin):
    list_display = ("id", "proyecto", "tema", "semestre")
    search_fields = ("tema", "proyecto__denominacion")


@admin.register(Evidencia)
class EvidenciaAdmin(admin.ModelAdmin):
    list_display = ("id", "informe", "nombre_archivo")
