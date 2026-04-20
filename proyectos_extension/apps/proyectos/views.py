from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect


@login_required
def nuevo_proyecto(request):
    return render(request, 'proyectos/nuevo_proyecto.html')


@login_required
def mis_proyectos(request):
    return render(request, 'proyectos/mis_proyectos.html')