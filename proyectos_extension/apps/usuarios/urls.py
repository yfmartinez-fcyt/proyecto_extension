from django.urls import path
from .views import login_view, logout_view, ver_perfil, soporte

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('perfil/', ver_perfil, name='ver_perfil'),
    path('soporte/', soporte, name='soporte'),
]