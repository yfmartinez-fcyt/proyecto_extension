from django.urls import path
from .views import soporte

urlpatterns = [
    path('soporte/', soporte, name='soporte'),
]