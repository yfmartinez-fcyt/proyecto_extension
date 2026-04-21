from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Core (inicio, dashboard)
    path('', include('apps.core.urls')),

    # Usuarios (login, logout, registro)
    path('usuarios/', include('apps.usuarios.urls')),

    # Proyectos
    path('proyectos/', include('apps.proyectos.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)