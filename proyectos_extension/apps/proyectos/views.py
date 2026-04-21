from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.http import Http404
import random


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

    return render(request, 'proyectos/repositorio_proyectos.html', {
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

    return render(request, 'proyectos/detalle_repositorio.html', {
        'proyecto': proyecto
    })


# MIS PROYECTOS 

@login_required
def mis_proyectos(request):

    proyectos = [
        # ✅ APROBADOS
        {
            "titulo": "Sistema Web de Biblioteca",
            "estado": "aprobado",
            "fecha": "2026-04-01"
        },
        {
            "titulo": "Aplicación Móvil de Salud",
            "estado": "aprobado",
            "fecha": "2026-04-02"
        },

        # ⏳ PENDIENTES
        {
            "titulo": "Sistema de Inventario",
            "estado": "pendiente",
            "fecha": "2026-04-03"
        },

        # 🟡 CON SUGERENCIAS
        {
            "titulo": "Plataforma Educativa",
            "estado": "sugerencias",
            "fecha": "2026-04-04",
            "comentario": "Mejorar la justificación del impacto social."
        },

        # 📝 BORRADOR
        {
            "titulo": "Sistema Contable",
            "estado": "borrador",
            "fecha": "2026-04-05"
        },

        # ❌ RECHAZADO
        {
            "titulo": "App de Delivery",
            "estado": "rechazado",
            "fecha": "2026-04-06",
            "comentario": "El proyecto no cumple con los requisitos mínimos."
        },
    ]

    return render(request, 'proyectos/mis_proyectos.html', {
        'proyectos': proyectos
    })
    
@login_required
def nuevo_proyecto(request):
    if request.method == "POST":
        accion = request.POST.get("accion")

        if accion == "borrador":
            estado = "BORRADOR"
        elif accion == "enviar":
            estado = "PENDIENTE"
        else:
            estado = "BORRADOR"  # fallback

        # Ejemplo: imprimir para probar
        print("Estado:", estado)

        # Aquí luego guardarías en la BD
        # Proyecto.objects.create(..., estado=estado)

        return redirect("mis_proyectos")

    return render(request, "proyectos/nuevo_proyecto.html")