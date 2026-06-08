"""
Catálogo de líneas, sublíneas y facultades para el formulario de proyectos.
Sincroniza datos mínimos en la BD legacy si faltan y expone JSON para el frontend.
"""

from apps.core.models import Facultad, LineaAccion, Sublinea

LINEAS_CATALOGO = [
    {
        "nombre": "Ambiente",
        "sublineas": [
            "Educación ambiental, producción de servicios sustentables, sostenidos y sostenibles",
            "Preservación de recursos naturales",
        ],
    },
    {
        "nombre": "Comunidad",
        "sublineas": [
            "Vinculación de la extensión universitaria con la Academia, la investigación y el bienestar estudiantil",
            "Prácticas socioeducativas, aprendizaje servicios o proyectos sociales estudiantiles",
        ],
    },
    {
        "nombre": "Desarrollo Tecnológico",
        "sublineas": [
            "Proyectos de innovación",
            "Investigación aplicada y resolución de problemas",
        ],
    },
]

FACULTADES_CATALOGO = [
    "Facultad de Ciencias y Tecnologías",
    "Facultad Ciencias de la Producción",
    "Facultad de Ciencias de la Salud",
    "Facultad de Ciencias Médicas",
    "Facultad de Odontología",
    "Facultad de Ciencias Económicas",
    "Facultad de Ciencias Sociales, Políticas y Humanidades",
    "Escuela Superior de Artes y Desarrollo de Talentos",
]


def sincronizar_catalogos():
    """Asegura líneas, sublíneas y facultades en la BD (solo crea si no existen por nombre)."""
    for item in LINEAS_CATALOGO:
        linea, _ = LineaAccion.objects.get_or_create(linea=item["nombre"])
        for texto_sub in item["sublineas"]:
            if not Sublinea.objects.filter(
                sublinea=texto_sub, linea_accion_id=linea.idlineaAccion
            ).exists():
                Sublinea.objects.create(
                    sublinea=texto_sub,
                    linea_accion_id=linea.idlineaAccion,
                )

    for nombre in FACULTADES_CATALOGO:
        if not Facultad.objects.filter(facultad=nombre).exists():
            Facultad.objects.create(facultad=nombre)


def _contexto_formulario():
    sincronizar_catalogos()

    lineas = []
    for linea in LineaAccion.objects.order_by("linea"):
        sublineas = [
            {
                "id": sub.idSublineas,
                "nombre": (sub.sublinea or "")[:200],
            }
            for sub in Sublinea.objects.filter(linea_accion_id=linea.idlineaAccion).order_by(
                "sublinea"
            )
        ]
        lineas.append(
            {
                "id": linea.idlineaAccion,
                "nombre": linea.linea or "",
                "sublineas": sublineas,
            }
        )

    unidades = [
        {"id": f.idFacultad, "nombre": f.facultad or ""}
        for f in Facultad.objects.order_by("facultad")
    ]

    return {
        "lineas": lineas,
        "unidades": unidades,
    }


def obtener_catalogo_formulario():
    """Dict para {{ catalogo|json_script }} en nuevo_proyecto.html."""
    return _contexto_formulario()
