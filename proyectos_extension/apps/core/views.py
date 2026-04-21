from django.shortcuts import render, redirect
from django.contrib import messages


def inicio(request):
    return render(request, 'core/inicio.html')


def lineas_accion(request):
    return render(request, 'core/lineas_accion.html')


def soporte_tecnico(request):
    return render(request, 'core/soporte_tecnico.html')

def repositorio_proyectos(request):
    return render(request, 'core/repositorio_proyectos.html')

#Datos de prueba por ahora
def inicio(request):
    context = {
        "total_aprobados": 193,
        "aprobados_anio": 41,
        "lineas_labels": [
            "Bienestar social y cultural",
            "Ambiente",
            "Comunidad",
            "Desarrollo tecnológico",
            "Economía",
            "Transversales"
        ],
        "lineas_data": [41, 30, 26, 27, 34, 35],
        "sublineas": {
            "Bienestar social y cultural": {
                "labels": [
                            "Inclusión Social y Promoción del Derecho", 
                            "Prevención de enfermedades",
                            "Promoción y servicios de la Salud",
                            "Promoción cultural y deportiva; formación cultural y desarrollo profesional"],
                "data": [7, 15, 8, 11],
            },
            "Ambiente": {
                "labels": ["Educación Ambiental, producción de servicios sustentables, sostenidos y sostenibles", "Preservación de recursos naturales"],
                "data": [10, 20],
            },
            "Comunidad": {
                "labels": ["Vinculación de la Extensión Universitaria con la Academia, la Investigación y el Bienestar Estudiantil para programas o proyectos", "Prácticas socioeducativas, aprendizaje, servicios o proyectos sociales estudiantiles"],
                "data": [12, 14],
            },
            "Desarrollo tecnológico": {
                "labels": ["Proyectos de Innovación", "Investigación aplicada y resolución de problemas", "Transferencias científicas y tecnológicas"],
                "data": [9, 8, 10],
            },
            "Economía": {
                "labels": ["Indicadores socioeconómicos para contribuir con las políticas públicas", "Generación del crecimiento económico a través de la innovación y el emprendedorismo"],
                "data": [19, 15],
            },
            "Transversales": {
                "labels": ["Servicio Técnico Profesional", "Espacio de intercambio de saberes", "Casos excepcionales"],
                "data": [15, 15, 5],
            },
        },
    }
    return render(request, "core/inicio.html", context)

def soporte_tecnico(request):

    if request.method == 'POST':
        # aquí luego puedes procesar datos
        messages.success(request, "Tu mensaje fue enviado correctamente.")
        return redirect('soporte_tecnico')

    return render(request, 'core/soporte_tecnico.html')