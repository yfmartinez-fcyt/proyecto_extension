from django.urls import path
from .views import presentar_informe

urlpatterns = [
    path('presentar-informe/', presentar_informe, name='presentar_informe'),
]