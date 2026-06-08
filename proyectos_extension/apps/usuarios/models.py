from django.contrib.auth.models import AbstractUser
from django.db import models


class TipoPersona(models.Model):
    idTipoPersona = models.AutoField(primary_key=True, db_column="idTipoPersona")
    tipo_persona = models.CharField(max_length=45, db_column="tipo_persona")

    class Meta:
        db_table = "Tipo_Persona"
        managed = False
        verbose_name = "Tipo de persona"
        verbose_name_plural = "Tipos de persona"

    def __str__(self):
        return self.tipo_persona


class Persona(models.Model):
    idPersona = models.AutoField(primary_key=True, db_column="idPersona")
    nombre = models.CharField(max_length=80, blank=True)
    apellido = models.CharField(max_length=80, blank=True)
    username = models.CharField(max_length=20, blank=True)
    correo = models.CharField(max_length=80, blank=True)
    contrasena = models.CharField(max_length=256, blank=True)
    tipo = models.ForeignKey(
        TipoPersona,
        on_delete=models.PROTECT,
        db_column="idTipoPersona",
    )

    class Meta:
        db_table = "personas"
        managed = False
        verbose_name = "Persona"
        verbose_name_plural = "Personas"

    @property
    def id(self):
        return self.idPersona

    def __str__(self):
        return f"{self.nombre} {self.apellido}".strip() or f"Persona #{self.idPersona}"


class Usuario(AbstractUser):
    ROLES = [
        ("alumno", "Alumno"),
        ("docente", "Docente"),
        ("admin", "Admin"),
        ("director_extension", "Director de Extension"),
    ]

    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=30, choices=ROLES, default="alumno")
    foto = models.ImageField(upload_to="perfiles/", blank=True, null=True)
    persona = models.ForeignKey(
        Persona,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios_django",
        db_column="idPersona",
    )

    class Meta:
        db_table = "usuarios_django"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"
