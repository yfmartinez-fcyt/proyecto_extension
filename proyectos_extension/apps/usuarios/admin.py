from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("username", "email", "rol", "is_staff", "is_active")
    list_filter = ("rol", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("username",)

    fieldsets = UserAdmin.fieldsets + (
        ("Extensión", {"fields": ("rol", "foto", "persona")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extensión", {"fields": ("rol",)}),
    )
