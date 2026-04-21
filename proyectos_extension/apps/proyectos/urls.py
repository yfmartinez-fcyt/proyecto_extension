from django.urls import path
from .views import nuevo_proyecto, mis_proyectos, proyectos_aprobados, detalle_proyecto

urlpatterns = [

     # 🟢 PROYECTOS DEL USUARIO
    path('mis-proyectos/', mis_proyectos, name='mis_proyectos'),
    path('nuevo/', nuevo_proyecto, name='nuevo_proyecto'),

    # 🟢 REPOSITORIO (APROBADOS)
    path('repositorio-proyectos/', proyectos_aprobados, name='repositorio_proyectos'),
    path('detalle-proyecto/<int:id>/', detalle_proyecto, name='detalle_proyecto'),
]