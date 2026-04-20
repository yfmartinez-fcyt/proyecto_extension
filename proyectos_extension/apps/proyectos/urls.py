from django.urls import path
from .views import nuevo_proyecto, mis_proyectos

urlpatterns = [
    path('nuevo/', nuevo_proyecto, name='nuevo_proyecto'),
    path('mis-proyectos/', mis_proyectos, name='mis_proyectos'),
]