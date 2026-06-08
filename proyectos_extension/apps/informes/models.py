from django.db import models

from apps.proyectos.models import Proyecto


class Informe(models.Model):
    id = models.AutoField(primary_key=True, db_column="idInforme")
    proyecto = models.ForeignKey(
        Proyecto,
        on_delete=models.CASCADE,
        related_name="informes",
        db_column="idProyecto",
    )
    semestre = models.CharField(max_length=45, blank=True)
    tema = models.TextField(blank=True)
    fecha_inicio = models.DateField(null=True, blank=True, db_column="fechaInicio")
    fecha_fin = models.DateField(null=True, blank=True, db_column="fechaFin")
    tiempo_duracion = models.CharField(max_length=45, blank=True, db_column="tiempoDuracion")
    medios_utilizados = models.TextField(blank=True, db_column="mediosUtilizados")
    descripcion = models.TextField(blank=True)
    logros_obtenidos = models.TextField(blank=True, db_column="logrosObtenidos")
    dificultades = models.TextField(blank=True)
    modalidad = models.CharField(max_length=45, blank=True)
    recomendaciones = models.TextField(blank=True)

    class Meta:
        db_table = "informes"
        managed = False
        verbose_name = "Informe"
        verbose_name_plural = "Informes"

    def __str__(self):
        return self.tema or f"Informe #{self.pk}"


class Evidencia(models.Model):
    id = models.AutoField(primary_key=True, db_column="idEvidencia")
    informe = models.ForeignKey(
        Informe,
        on_delete=models.CASCADE,
        related_name="evidencias",
        db_column="idInforme",
    )
    tipo_archivo = models.CharField(max_length=45, blank=True)
    nombre_archivo = models.CharField(max_length=255, blank=True)
    ruta_archivo = models.CharField(max_length=255, blank=True)
    fecha_subida = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "evidencias"
        managed = False
        verbose_name = "Evidencia"
        verbose_name_plural = "Evidencias"
