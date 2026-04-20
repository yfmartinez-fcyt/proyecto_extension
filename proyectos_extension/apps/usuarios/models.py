from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    ROLES = [
        ('alumno', 'Alumno'),
        ('docente', 'Docente'),
        ('admin', 'Admin'),
        ('director_extension', 'Director de Extension'),
    ]

    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=30, choices=ROLES, default='alumno')
    foto = models.ImageField(upload_to='perfiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"