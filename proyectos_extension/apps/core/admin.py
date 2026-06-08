from django.contrib import admin

from .models import Actividad, Facultad, LineaAccion, Sublinea

admin.site.register(LineaAccion)
admin.site.register(Sublinea)
admin.site.register(Facultad)
admin.site.register(Actividad)
