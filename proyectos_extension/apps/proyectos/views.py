<<<<<<< HEAD
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect


@login_required
def nuevo_proyecto(request):
    return render(request, 'proyectos/nuevo_proyecto.html')


@login_required
def mis_proyectos(request):
    return render(request, 'proyectos/mis_proyectos.html')
=======
from django.shortcuts import render
from django.http import Http404


# 🟢 DASHBOARD
def inicio(request):
    return render(request, 'inicio.html')


# 🟢 PROYECTOS APROBADOS (CON BUSCADOR)
def proyectos_aprobados(request):
    query = request.GET.get('q', '')

    proyectos = [
        {
            "id": 1,
            "titulo": "Sistema de Gestión Educativa",
            "fecha": "15/03/2026",
            "resumen": "Plataforma para administrar cursos y estudiantes."
        },
        {
            "id": 2,
            "titulo": "App de Salud Comunitaria",
            "fecha": "02/04/2026",
            "resumen": "Aplicación para monitoreo de pacientes rurales."
        },
        {
            "id": 3,
            "titulo": "Portal de Extensión Universitaria",
            "fecha": "10/04/2026",
            "resumen": "Sistema web para gestión de proyectos."
        }
    ]

    # 🔎 FILTRO POR NOMBRE O FECHA
    if query:
        query_lower = query.lower()
        proyectos = [
            p for p in proyectos
            if query_lower in p["titulo"].lower() or query in p["fecha"]
        ]

    return render(request, 'proyectos_aprobados.html', {
        'proyectos': proyectos,
        'query': query
    })


# 🟢 DETALLE DE PROYECTO
def detalle_proyecto(request, id):
    proyectos = [
        {
            "id": 1,
            "titulo": "Sistema de Gestión Educativa",
            "fecha": "15/03/2026",
            "descripcion": "Sistema completo para gestionar alumnos, docentes y cursos."
        },
        {
            "id": 2,
            "titulo": "App de Salud Comunitaria",
            "fecha": "02/04/2026",
            "descripcion": "Aplicación para seguimiento de pacientes en zonas rurales."
        },
        {
            "id": 3,
            "titulo": "Portal de Extensión Universitaria",
            "fecha": "10/04/2026",
            "descripcion": "Plataforma institucional para gestión de proyectos."
        }
    ]

    proyecto = next((p for p in proyectos if p["id"] == id), None)

    if not proyecto:
        raise Http404("Proyecto no encontrado")

    return render(request, 'detalle_proyecto.html', {
        'proyecto': proyecto
    })


# 🟢 SOPORTE
def soporte(request):
    enviado = False

    if request.method == 'POST':
        enviado = True

    return render(request, 'soporte.html', {
        'enviado': enviado
    })
>>>>>>> 2618179c47cb6f73b87dd7543460c7b6ae5f5c5b
