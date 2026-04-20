from django.shortcuts import render


def inicio(request):
    return render(request, 'core/inicio.html')


def lineas_accion(request):
    return render(request, 'core/lineas_accion.html')


def soporte_tecnico(request):
    return render(request, 'core/soporte_tecnico.html')