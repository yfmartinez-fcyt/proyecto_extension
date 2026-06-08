from datetime import date, datetime

from django.db import transaction
from django.utils import timezone

from apps.core.catalog import sincronizar_catalogos
from apps.core.models import Actividad, Facultad, Sublinea
from apps.proyectos.constants import EstadoProyecto
from apps.proyectos.models import Cronograma, Presupuesto, Proyecto, ProyectoUnidadAcademica
from apps.usuarios.models import Persona, TipoPersona

CRONOGRAMA_SLOTS = [
    ("cronograma_actividad_1", "1"),
    ("cronograma_actividad_2", "2"),
    ("cronograma_actividad_3", "3"),
    ("cronograma_actividad_4", "4"),
    ("cronograma_actividad_5", "5"),
    ("cronograma_actividad_6", "6"),
    ("cronograma_actividad_7", "7"),
]


class ErrorGuardadoProyecto(Exception):
    """Error de validación al persistir el formulario."""


def _valor(post, clave, default=""):
    return (post.get(clave) or default).strip()


def _es_estudiante(post):
    return _valor(post, "estudiante_proponente").lower() in ("sí", "si", "yes", "1", "true")


def _asegurar_tipos_persona():
    for nombre in ("Alumno", "Docente", "Administrador"):
        if not TipoPersona.objects.filter(tipo_persona=nombre).exists():
            TipoPersona.objects.create(tipo_persona=nombre)


def _obtener_sublinea(post):
    sublinea_id = _valor(post, "sublinea_id")
    if not sublinea_id:
        raise ErrorGuardadoProyecto("Debe seleccionar una línea de acción y sublínea válidas.")

    try:
        sublinea_pk = int(sublinea_id)
    except ValueError as exc:
        raise ErrorGuardadoProyecto("La sublínea seleccionada no es válida.") from exc

    sublinea = Sublinea.objects.filter(pk=sublinea_pk).first()
    if not sublinea:
        sincronizar_catalogos()
        sublinea = Sublinea.objects.filter(pk=sublinea_pk).first()
    if not sublinea:
        raise ErrorGuardadoProyecto("No se encontró la sublínea seleccionada en el catálogo.")
    return sublinea


def _obtener_o_crear_persona(post, usuario):
    correo = _valor(post, "correo_proponente")
    if not correo:
        raise ErrorGuardadoProyecto("El correo del proponente es obligatorio.")

    persona = None
    if usuario and getattr(usuario, "persona_id", None):
        persona = usuario.persona

    if persona is None:
        persona = Persona.objects.filter(correo__iexact=correo).first()

    tipo_nombre = "Alumno" if _es_estudiante(post) else "Docente"
    tipo = TipoPersona.objects.filter(tipo_persona=tipo_nombre).first()
    if not tipo:
        _asegurar_tipos_persona()
        tipo = TipoPersona.objects.get(tipo_persona=tipo_nombre)

    datos = {
        "nombre": _valor(post, "nombre_proponente"),
        "apellido": _valor(post, "apellido_proponente"),
        "correo": correo,
        "username": (usuario.username if usuario else correo.split("@")[0])[:20],
        "contrasena": "",
        "tipo_id": tipo.idTipoPersona,
    }

    if persona:
        for campo, valor in datos.items():
            setattr(persona, campo, valor)
        persona.save()
    else:
        persona = Persona.objects.create(**datos)
        if usuario and not usuario.persona_id:
            usuario.persona = persona
            usuario.save(update_fields=["persona"])

    return persona


def _parse_fecha(valor):
    if not valor:
        return None
    return date.fromisoformat(valor)


def _parse_hora_texto(valor):
    if not valor:
        return ""
    return valor[:5]


def _parse_hora_datetime(fecha_valor, hora_valor):
    if not hora_valor:
        return None
    hora_parsed = datetime.strptime(hora_valor, "%H:%M").time()
    base = fecha_valor or date.today()
    return timezone.make_aware(datetime.combine(base, hora_parsed))


def _parse_int(valor):
    if valor in (None, ""):
        return None
    return int(valor)


def _dividir_objetivos(texto):
    texto = texto.strip()
    if not texto:
        return "", ""
    lineas = [l.strip() for l in texto.splitlines() if l.strip()]
    if not lineas:
        return texto[:255], texto
    return lineas[0][:255], texto


def _estado_desde_accion(accion):
    if accion == "enviar":
        return EstadoProyecto.PENDIENTE
    return EstadoProyecto.BORRADOR


def _iter_actividades_cronograma(post):
    for campo_actividad, sufijo in CRONOGRAMA_SLOTS:
        nombre = _valor(post, campo_actividad)
        if not nombre:
            continue
        yield {
            "nombre": nombre,
            "fecha_inicio": _parse_fecha(_valor(post, f"cronograma_inicio_{sufijo}")),
            "cantidad_dias": _parse_int(_valor(post, f"cronograma_dias_{sufijo}")),
            "hora": _valor(post, f"cronograma_hora_{sufijo}"),
            "fecha_fin": _parse_fecha(_valor(post, f"cronograma_fin_{sufijo}")),
            "horas_ext": _parse_int(_valor(post, f"cronograma_credito_{sufijo}")),
        }


def obtener_proyecto_editable(proyecto_id, usuario):
    if not usuario or not usuario.is_authenticated:
        return None
    return (
        Proyecto.objects.select_related("sublinea__linea_accion", "proponente__tipo")
        .prefetch_related("unidades_academicas")
        .filter(
            pk=proyecto_id,
            usuario_id=usuario.id,
            estado__in=EstadoProyecto.EDITABLES,
        )
        .first()
    )


def _guardar_relaciones_proyecto(proyecto_id, post):
    for id_facultad in post.getlist("unidad_academica[]"):
        id_facultad = id_facultad.strip()
        if not id_facultad:
            continue
        try:
            facultad = Facultad.objects.get(pk=int(id_facultad))
        except (ValueError, Facultad.DoesNotExist):
            raise ErrorGuardadoProyecto("Unidad académica no válida.") from None
        ProyectoUnidadAcademica.objects.create(
            proyecto_id=proyecto_id, nombre=facultad.facultad
        )

    texto_presupuesto = _valor(post, "presupuesto")
    if texto_presupuesto:
        Presupuesto.objects.create(
            proyecto_id=proyecto_id,
            descripcion=texto_presupuesto[:500],
            cantidad=1,
            unidad="texto",
            recursos="formulario",
            total="0",
        )

    for item in _iter_actividades_cronograma(post):
        actividad = Actividad.objects.filter(nombre=item["nombre"]).first()
        if not actividad:
            actividad = Actividad.objects.create(nombre=item["nombre"])
        Cronograma.objects.create(
            proyecto_id=proyecto_id,
            actividad_id=actividad.idActividad,
            fecha_inicio=item["fecha_inicio"],
            cantidad_dias=item["cantidad_dias"],
            hora=_parse_hora_datetime(item["fecha_inicio"], item["hora"]),
            fecha_fin=item["fecha_fin"],
            horas_extension=item["horas_ext"],
        )


def _limpiar_relaciones_proyecto(proyecto_id):
    ProyectoUnidadAcademica.objects.filter(proyecto_id=proyecto_id).delete()
    Presupuesto.objects.filter(proyecto_id=proyecto_id).delete()
    Cronograma.objects.filter(proyecto_id=proyecto_id).delete()


def _unidades_academicas_ids(proyecto):
    ids = []
    for ua in proyecto.unidades_academicas.all():
        facultad = Facultad.objects.filter(facultad=ua.nombre).first()
        if facultad:
            ids.append(facultad.idFacultad)
    return ids


def _cronograma_inicial(proyecto_id):
    filas = list(
        Cronograma.objects.filter(proyecto_id=proyecto_id)
        .select_related("actividad")
        .order_by("idCronograma")
    )
    datos = {}
    for i, (campo_actividad, sufijo) in enumerate(CRONOGRAMA_SLOTS):
        if i >= len(filas):
            break
        fila = filas[i]
        datos[campo_actividad] = (fila.actividad.nombre or "") if fila.actividad else ""
        if fila.fecha_inicio:
            datos[f"cronograma_inicio_{sufijo}"] = fila.fecha_inicio.isoformat()
        if fila.cantidad_dias is not None:
            datos[f"cronograma_dias_{sufijo}"] = str(fila.cantidad_dias)
        if fila.hora:
            datos[f"cronograma_hora_{sufijo}"] = fila.hora.strftime("%H:%M")
        if fila.fecha_fin:
            datos[f"cronograma_fin_{sufijo}"] = fila.fecha_fin.isoformat()
        if fila.horas_extension is not None:
            datos[f"cronograma_credito_{sufijo}"] = str(fila.horas_extension)
    return datos


def obtener_initial_formulario(proyecto):
    """Datos del proyecto en formato del formulario (para precargar el wizard)."""
    proponente = proyecto.proponente
    sublinea = proyecto.sublinea
    linea = sublinea.linea_accion if sublinea else None

    objetivos = proyecto.objetivos_especificos or ""
    if proyecto.obj_general and proyecto.obj_general not in objetivos[:255]:
        objetivos = proyecto.obj_general + (
            "\n" + objetivos if objetivos else ""
        )

    es_alumno = (
        proponente
        and proponente.tipo
        and proponente.tipo.tipo_persona == "Alumno"
    )

    presupuesto = (
        Presupuesto.objects.filter(proyecto_id=proyecto.idProyecto)
        .order_by("idPresupuesto")
        .first()
    )

    initial = {
        "nombre_proponente": proponente.nombre if proponente else "",
        "apellido_proponente": proponente.apellido if proponente else "",
        "correo_proponente": proponente.correo if proponente else "",
        "telefono_proponente": proyecto.telefono_proponente or "",
        "estudiante_proponente": "Sí" if es_alumno else "No",
        "docente_responsable": proyecto.docente_responsable or "",
        "linea_id": linea.idlineaAccion if linea else "",
        "sublinea_id": sublinea.idSublineas if sublinea else "",
        "fecha_inicio": proyecto.fecha_inicio.isoformat() if proyecto.fecha_inicio else "",
        "fecha_fin": proyecto.fecha_fin.isoformat() if proyecto.fecha_fin else "",
        "hora": proyecto.hora_inicio or "",
        "horas": str(proyecto.horas_asignadas) if proyecto.horas_asignadas is not None else "",
        "unidad_academica_ids": _unidades_academicas_ids(proyecto),
        "carrera": proyecto.carrera_texto or "",
        "curso": proyecto.curso or "",
        "organizaciones": proyecto.involucrados or "",
        "fundamentacion": proyecto.fundamentacion or "",
        "objetivos": objetivos,
        "metodologia": proyecto.metodologia or "",
        "metas": proyecto.metas or "",
        "resultados": proyecto.resultados or "",
        "recursos_humanos": proyecto.recursos_humanos or "",
        "proponente": proyecto.proponente_actividad or "",
        "beneficiarios": proyecto.beneficiarios or "",
        "localizacion": proyecto.localizacion or "",
        "presupuesto": presupuesto.descripcion if presupuesto else "",
        "estado": proyecto.estado or EstadoProyecto.BORRADOR,
    }
    initial.update(_cronograma_inicial(proyecto.idProyecto))
    return initial


@transaction.atomic
def guardar_proyecto_desde_formulario(post, usuario, accion, proyecto_id=None):
    sincronizar_catalogos()
    _asegurar_tipos_persona()

    proyecto_existente = None
    if proyecto_id:
        proyecto_existente = obtener_proyecto_editable(proyecto_id, usuario)
        if not proyecto_existente:
            raise ErrorGuardadoProyecto(
                "No puede editar este proyecto o ya no está disponible para cambios."
            )

    estado = _estado_desde_accion(accion)
    sublinea = _obtener_sublinea(post)
    persona = _obtener_o_crear_persona(post, usuario)
    objetivos = _valor(post, "objetivos")
    obj_general, objetivos_completos = _dividir_objetivos(objetivos)
    ahora = timezone.now()

    if proyecto_existente:
        proyecto = proyecto_existente
        proyecto.denominacion = sublinea.sublinea[:255]
        proyecto.sublinea_id = sublinea.idSublineas
        proyecto.fecha_inicio = _parse_fecha(_valor(post, "fecha_inicio"))
        proyecto.fecha_fin = _parse_fecha(_valor(post, "fecha_fin"))
        proyecto.hora_inicio = _parse_hora_texto(_valor(post, "hora"))
        proyecto.horas_asignadas = _parse_int(_valor(post, "horas"))
        proyecto.involucrados = _valor(post, "organizaciones")
        proyecto.fundamentacion = _valor(post, "fundamentacion")
        proyecto.obj_general = obj_general
        proyecto.objetivos_especificos = objetivos_completos
        proyecto.metodologia = _valor(post, "metodologia")
        proyecto.metas = _valor(post, "metas")
        proyecto.resultados = _valor(post, "resultados")
        proyecto.recursos_humanos = _valor(post, "recursos_humanos")
        proyecto.proponente_id = persona.idPersona
        proyecto.telefono_proponente = _valor(post, "telefono_proponente")
        proyecto.docente_responsable = (
            _valor(post, "docente_responsable") if _es_estudiante(post) else ""
        )
        proyecto.beneficiarios = _valor(post, "beneficiarios")
        proyecto.localizacion = _valor(post, "localizacion")
        proyecto.estado = estado
        proyecto.curso = _valor(post, "curso")
        proyecto.carrera_texto = _valor(post, "carrera")
        proyecto.proponente_actividad = _valor(post, "proponente")
        proyecto.actualizado_en = ahora
        proyecto.save()
        _limpiar_relaciones_proyecto(proyecto.idProyecto)
    else:
        proyecto = Proyecto(
            denominacion=sublinea.sublinea[:255],
            sublinea_id=sublinea.idSublineas,
            fecha_inicio=_parse_fecha(_valor(post, "fecha_inicio")),
            fecha_fin=_parse_fecha(_valor(post, "fecha_fin")),
            hora_inicio=_parse_hora_texto(_valor(post, "hora")),
            horas_asignadas=_parse_int(_valor(post, "horas")),
            involucrados=_valor(post, "organizaciones"),
            fundamentacion=_valor(post, "fundamentacion"),
            obj_general=obj_general,
            objetivos_especificos=objetivos_completos,
            metodologia=_valor(post, "metodologia"),
            metas=_valor(post, "metas"),
            resultados=_valor(post, "resultados"),
            recursos_humanos=_valor(post, "recursos_humanos"),
            proponente_id=persona.idPersona,
            telefono_proponente=_valor(post, "telefono_proponente"),
            docente_responsable=_valor(post, "docente_responsable") if _es_estudiante(post) else "",
            beneficiarios=_valor(post, "beneficiarios"),
            localizacion=_valor(post, "localizacion"),
            estado=estado,
            curso=_valor(post, "curso"),
            carrera_texto=_valor(post, "carrera"),
            proponente_actividad=_valor(post, "proponente"),
            usuario_id=usuario.id if usuario else None,
            creado_en=ahora,
            actualizado_en=ahora,
        )
        proyecto.save(force_insert=True)

    _guardar_relaciones_proyecto(proyecto.idProyecto, post)
    return proyecto, estado


@transaction.atomic
def eliminar_proyecto_de_usuario(proyecto_id, usuario):
    proyecto = obtener_proyecto_editable(proyecto_id, usuario)
    if not proyecto:
        raise ErrorGuardadoProyecto(
            "No puede eliminar este proyecto o ya no está disponible."
        )
    pid = proyecto.idProyecto
    _limpiar_relaciones_proyecto(pid)
    proyecto.delete()
    return pid
