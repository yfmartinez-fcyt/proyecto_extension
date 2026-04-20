from django.urls import path
from .views import inicio, lineas_accion, soporte_tecnico

urlpatterns = [
    path('', inicio, name='inicio'),
    path('lineas-de-accion/', lineas_accion, name='lineas_accion'),
    path('soporte-tecnico/', soporte_tecnico, name='soporte_tecnico'),
]