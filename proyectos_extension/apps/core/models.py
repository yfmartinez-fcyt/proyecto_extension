from django.db import models


class LineaAccion(models.Model):
    idlineaAccion = models.AutoField(primary_key=True, db_column="idlineaAccion")
    linea = models.CharField(max_length=120, db_column="linea", blank=True)

    class Meta:
        db_table = "lineas_accion"
        managed = False
        verbose_name = "Línea de acción"
        verbose_name_plural = "Líneas de acción"

    @property
    def id(self):
        return self.idlineaAccion

    def __str__(self):
        return self.linea or f"Línea #{self.idlineaAccion}"


class Sublinea(models.Model):
    idSublineas = models.AutoField(primary_key=True, db_column="idSublineas")
    sublinea = models.TextField(db_column="sublinea", blank=True)
    descripcion = models.TextField(blank=True)
    linea_accion = models.ForeignKey(
        LineaAccion,
        on_delete=models.PROTECT,
        related_name="sublineas",
        db_column="idlineaAccion",
    )
    horas_organizador = models.IntegerField(
        null=True, blank=True, db_column="horasOrganizador"
    )
    horas_participante = models.IntegerField(
        null=True, blank=True, db_column="horasParticipante"
    )
    horas_participante_internacional = models.IntegerField(
        null=True, blank=True, db_column="horasParticipanteInternacional"
    )

    class Meta:
        db_table = "sublineas"
        managed = False
        verbose_name = "Sublínea"
        verbose_name_plural = "Sublíneas"

    @property
    def id(self):
        return self.idSublineas

    def __str__(self):
        return (self.sublinea or f"Sublínea #{self.idSublineas}")[:80]


class Facultad(models.Model):
    idFacultad = models.AutoField(primary_key=True, db_column="idFacultad")
    facultad = models.TextField(blank=True)

    class Meta:
        db_table = "facultades"
        managed = False
        verbose_name = "Facultad / unidad académica"
        verbose_name_plural = "Facultades / unidades académicas"
        ordering = ["facultad"]

    @property
    def id(self):
        return self.idFacultad

    def __str__(self):
        return (self.facultad or f"Facultad #{self.idFacultad}")[:80]


class Actividad(models.Model):
    idActividad = models.AutoField(primary_key=True, db_column="idActividad")
    nombre = models.TextField(db_column="nombreActividad", blank=True)

    class Meta:
        db_table = "actividades"
        managed = False
        verbose_name = "Actividad"
        verbose_name_plural = "Actividades"

    @property
    def id(self):
        return self.idActividad

    def __str__(self):
        return (self.nombre or f"Actividad #{self.idActividad}")[:80]
