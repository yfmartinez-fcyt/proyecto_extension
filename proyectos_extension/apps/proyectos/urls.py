from django.urls import path
from .views import inicio, proyectos_aprobados, soporte, detalle_proyecto

urlpatterns = [
    path('', inicio, name='inicio'),
    path('aprobados/', proyectos_aprobados, name='proyectos_aprobados'),
    path('proyecto/<int:id>/', detalle_proyecto, name='detalle_proyecto'),
    path('soporte/', soporte, name='soporte'),
]