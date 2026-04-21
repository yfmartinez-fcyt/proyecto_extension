from django.urls import path
<<<<<<< HEAD
from .views import nuevo_proyecto, mis_proyectos

urlpatterns = [
    path('nuevo/', nuevo_proyecto, name='nuevo_proyecto'),
    path('mis-proyectos/', mis_proyectos, name='mis_proyectos'),
=======
from .views import inicio, proyectos_aprobados, soporte, detalle_proyecto

urlpatterns = [
    path('', inicio, name='inicio'),
    path('aprobados/', proyectos_aprobados, name='proyectos_aprobados'),
    path('proyecto/<int:id>/', detalle_proyecto, name='detalle_proyecto'),
    path('soporte/', soporte, name='soporte'),
>>>>>>> 2618179c47cb6f73b87dd7543460c7b6ae5f5c5b
]