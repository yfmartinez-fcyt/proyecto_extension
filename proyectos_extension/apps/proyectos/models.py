from django.conf import settings
from django.db import models

from apps.core.models import Actividad, Sublinea
from apps.usuarios.models import Persona


class Proyecto(models.Model):
    idProyecto = models.AutoField(primary_key=True, db_column="idProyecto")
    denominacion = models.CharField(max_length=255, blank=True)
    sublinea = models.ForeignKey(
        Sublinea,
        on_delete=models.PROTECT,
        db_column="idSublineas",
    )
    fecha_inicio = models.DateField(null=True, blank=True, db_column="fechaInicio")
    fecha_fin = models.DateField(null=True, blank=True, db_column="fechaFin")
    hora_inicio = models.CharField(max_length=20, blank=True, db_column="horaInicio")
    horas_asignadas = models.PositiveIntegerField(
        null=True, blank=True, db_column="horasAsignadas"
    )
    involucrados = models.TextField(blank=True)
    fundamentacion = models.TextField(blank=True)
    obj_general = models.CharField(max_length=255, blank=True, db_column="objGeneral")
    objetivos_especificos = models.TextField(blank=True, db_column="objetivosEspecificos")
    metodologia = models.TextField(blank=True)
    metas = models.TextField(blank=True)
    resultados = models.TextField(blank=True)
    recursos_humanos = models.TextField(blank=True, db_column="recursosHumanos")
    proponente = models.ForeignKey(
        Persona,
        on_delete=models.PROTECT,
        db_column="idProponente",
        related_name="proyectos",
    )
    telefono_proponente = models.CharField(
        max_length=20, blank=True, db_column="telefonoProponente"
    )
    docente_responsable = models.CharField(
        max_length=100, blank=True, db_column="docenteResponsable"
    )
    beneficiarios = models.TextField(blank=True)
    localizacion = models.TextField(blank=True)
    estado = models.CharField(max_length=45, blank=True)
    curso = models.CharField(max_length=80, blank=True)
    carrera_texto = models.CharField(max_length=120, blank=True, db_column="carreraTexto")
    proponente_actividad = models.CharField(
        max_length=120, blank=True, db_column="proponenteActividad"
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="proyectos",
        db_column="idUsuarioDjango",
    )
    creado_en = models.DateTimeField(auto_now_add=True, db_column="creadoEn")
    actualizado_en = models.DateTimeField(auto_now=True, db_column="actualizadoEn")

    class Meta:
        db_table = "proyectos"
        managed = False
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"
        ordering = ["-idProyecto"]

    @property
    def id(self):
        return self.idProyecto

    def __str__(self):
        return self.denominacion or f"Proyecto #{self.idProyecto}"


class ProyectoUnidadAcademica(models.Model):
    id = models.AutoField(primary_key=True)
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="unidades_academicas",
        db_column="idProyecto",
    )
    nombre = models.CharField(max_length=200)

    class Meta:
        db_table = "proyecto_unidades_academicas"
        managed = False
        verbose_name = "Unidad académica del proyecto"
        verbose_name_plural = "Unidades académicas del proyecto"

    def __str__(self):
        return self.nombre


class Cronograma(models.Model):
    idCronograma = models.AutoField(primary_key=True, db_column="idCronograma")
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="cronograma",
        db_column="idProyecto",
    )
    actividad = models.ForeignKey(
        Actividad,
        on_delete=models.PROTECT,
        db_column="idactividad",
    )
    fecha_inicio = models.DateField(null=True, blank=True, db_column="fechaInicio")
    cantidad_dias = models.IntegerField(null=True, blank=True, db_column="cantidadDias")
    hora = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateField(null=True, blank=True, db_column="fechaFin")
    horas_extension = models.IntegerField(null=True, blank=True, db_column="horasExt")

    class Meta:
        db_table = "cronograma"
        managed = False
        verbose_name = "Cronograma"
        verbose_name_plural = "Cronograma"

    def __str__(self):
        return f"Cronograma #{self.idCronograma}"


class ProyectoRevision(models.Model):
    """Historial institucional de decisiones del Director de Extensión."""

    id = models.AutoField(primary_key=True)
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="revisiones",
        db_column="idProyecto",
    )
    director = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="revisiones_realizadas",
        db_column="idUsuarioDirector",
    )
    accion = models.CharField(max_length=30)
    comentario = models.TextField(blank=True)
    estado_anterior = models.CharField(max_length=45, blank=True, db_column="estadoAnterior")
    estado_nuevo = models.CharField(max_length=45, blank=True, db_column="estadoNuevo")
    creado_en = models.DateTimeField(auto_now_add=True, db_column="creadoEn")

    class Meta:
        db_table = "proyecto_revisiones"
        managed = False
        verbose_name = "Revisión de proyecto"
        verbose_name_plural = "Revisiones de proyectos"
        ordering = ["-creado_en", "-id"]

    def __str__(self):
        return f"Revisión #{self.id} — {self.accion}"


class Presupuesto(models.Model):
    idPresupuesto = models.AutoField(primary_key=True, db_column="idPresupuesto")
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="presupuestos",
        db_column="idProyecto",
    )
    descripcion = models.TextField(blank=True)
    cantidad = models.IntegerField(null=True, blank=True)
    unidad = models.CharField(max_length=45, blank=True)
    recursos = models.CharField(max_length=45, blank=True)
    total = models.CharField(max_length=45, blank=True)

    class Meta:
        db_table = "presupuestos"
        managed = False
        verbose_name = "Presupuesto"
        verbose_name_plural = "Presupuestos"
