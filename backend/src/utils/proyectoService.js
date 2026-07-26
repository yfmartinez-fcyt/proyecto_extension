const { pool } = require('../config/db');
const { EstadoProyecto } = require('./constants');

const CRONOGRAMA_SLOTS = [1, 2, 3, 4, 5, 6, 7];

function valor(obj, clave, def = '') {
  const v = obj?.[clave];
  if (v === undefined || v === null) return def;
  return String(v).trim();
}

/** Convierte Date/string a YYYY-MM-DD; null si inválido o vacío. */
function toDateSql(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
}

function esEstudiante(body) {
  return ['sí', 'si', 'yes', '1', 'true'].includes(
    valor(body, 'estudiante_proponente').toLowerCase()
  );
}

function dividirObjetivos(texto) {
  const t = (texto || '').trim();
  if (!t) return { objGeneral: '', objetivosCompletos: '' };
  const lineas = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lineas.length) return { objGeneral: t.slice(0, 255), objetivosCompletos: t };
  return { objGeneral: lineas[0].slice(0, 255), objetivosCompletos: t };
}

function estadoDesdeAccion(accion) {
  return accion === 'enviar' ? EstadoProyecto.PENDIENTE : EstadoProyecto.BORRADOR;
}

/** Actualiza nombre/apellido del usuario (única tabla de gente). */
async function actualizarUsuarioProponente(client, body, usuario) {
  const correo = valor(body, 'correo_proponente');
  if (!correo) {
    throw Object.assign(new Error('El correo del proponente es obligatorio.'), { status: 400 });
  }

  const nombre = valor(body, 'nombre_proponente');
  const apellido = valor(body, 'apellido_proponente');

  const upd = await client.query(
    `UPDATE usuarios
     SET nombre = COALESCE(NULLIF($1, ''), nombre),
         apellido = COALESCE(NULLIF($2, ''), apellido)
     WHERE id = $3
     RETURNING *`,
    [nombre, apellido, usuario.id]
  );
  return upd.rows[0];
}

async function obtenerSublinea(client, body) {
  const sublineaId = valor(body, 'sublinea_id');
  if (!sublineaId) {
    throw Object.assign(new Error('Debe seleccionar una línea de acción y sublínea válidas.'), { status: 400 });
  }
  const r = await client.query('SELECT * FROM sublineas WHERE id = $1', [Number(sublineaId)]);
  if (!r.rows[0]) {
    throw Object.assign(new Error('No se encontró la sublínea seleccionada en el catálogo.'), { status: 400 });
  }
  return r.rows[0];
}

function iterCronograma(body) {
  const items = [];
  for (const n of CRONOGRAMA_SLOTS) {
    const nombre = valor(body, `cronograma_actividad_${n}`);
    if (!nombre) continue;
    items.push({
      nombre,
      fecha_inicio: toDateSql(valor(body, `cronograma_inicio_${n}`)),
      cantidad_dias: valor(body, `cronograma_dias_${n}`) ? Number(valor(body, `cronograma_dias_${n}`)) : null,
      hora_texto: valor(body, `cronograma_hora_${n}`).slice(0, 5),
      fecha_fin: toDateSql(valor(body, `cronograma_fin_${n}`)),
      horas_ext: valor(body, `cronograma_credito_${n}`) ? Number(valor(body, `cronograma_credito_${n}`)) : null,
    });
  }
  return items;
}

async function limpiarRelaciones(client, proyectoId) {
  await client.query('DELETE FROM proyecto_unidades_academicas WHERE proyecto_id=$1', [proyectoId]);
  await client.query('DELETE FROM presupuestos WHERE proyecto_id=$1', [proyectoId]);
  await client.query('DELETE FROM cronograma WHERE proyecto_id=$1', [proyectoId]);
}

async function guardarRelaciones(client, proyectoId, body) {
  const unidades = body.unidad_academica_ids || body.unidad_academica || [];
  const lista = Array.isArray(unidades) ? unidades : [unidades];
  for (const idFac of lista) {
    if (!idFac) continue;
    const fac = await client.query('SELECT nombre FROM facultades WHERE id=$1', [Number(idFac)]);
    if (!fac.rows[0]) {
      throw Object.assign(new Error('Unidad académica no válida.'), { status: 400 });
    }
    await client.query(
      'INSERT INTO proyecto_unidades_academicas (proyecto_id, nombre) VALUES ($1,$2)',
      [proyectoId, fac.rows[0].nombre]
    );
  }

  const textoPresupuesto = valor(body, 'presupuesto');
  if (textoPresupuesto) {
    await client.query(
      `INSERT INTO presupuestos (proyecto_id, descripcion, cantidad, unidad, recursos, total)
       VALUES ($1,$2,1,'texto','formulario','0')`,
      [proyectoId, textoPresupuesto.slice(0, 500)]
    );
  }

  for (const item of iterCronograma(body)) {
    let act = await client.query('SELECT id FROM actividades WHERE nombre=$1 LIMIT 1', [item.nombre]);
    let actividadId;
    if (act.rows[0]) {
      actividadId = act.rows[0].id;
    } else {
      act = await client.query('INSERT INTO actividades (nombre) VALUES ($1) RETURNING id', [item.nombre]);
      actividadId = act.rows[0].id;
    }
    await client.query(
      `INSERT INTO cronograma
        (proyecto_id, actividad_id, fecha_inicio, cantidad_dias, hora_texto, fecha_fin, horas_extension)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        proyectoId,
        actividadId,
        item.fecha_inicio,
        item.cantidad_dias,
        item.hora_texto,
        item.fecha_fin,
        item.horas_ext,
      ]
    );
  }
}

async function obtenerProyectoEditable(client, proyectoId, usuarioId) {
  const r = await client.query(
    `SELECT * FROM proyectos
     WHERE id=$1 AND usuario_id=$2 AND estado = ANY($3::text[])`,
    [proyectoId, usuarioId, EstadoProyecto.EDITABLES]
  );
  return r.rows[0] || null;
}

async function construirFormulario(client, proyecto) {
  const usuario = proyecto.usuario_id
    ? (
        await client.query(
          'SELECT id, nombre, apellido, email, rol FROM usuarios WHERE id=$1',
          [proyecto.usuario_id]
        )
      ).rows[0]
    : null;

  let lineaId = '';
  let sublineaId = proyecto.sublinea_id || '';
  if (proyecto.sublinea_id) {
    const s = await client.query('SELECT linea_id FROM sublineas WHERE id=$1', [proyecto.sublinea_id]);
    if (s.rows[0]) lineaId = s.rows[0].linea_id;
  }

  const uas = await client.query(
    'SELECT nombre FROM proyecto_unidades_academicas WHERE proyecto_id=$1',
    [proyecto.id]
  );
  const unidadIds = [];
  for (const ua of uas.rows) {
    const f = await client.query('SELECT id FROM facultades WHERE nombre=$1', [ua.nombre]);
    if (f.rows[0]) unidadIds.push(f.rows[0].id);
  }

  const presup = await client.query(
    'SELECT descripcion FROM presupuestos WHERE proyecto_id=$1 ORDER BY id LIMIT 1',
    [proyecto.id]
  );

  let objetivos = proyecto.objetivos_especificos || '';
  if (proyecto.obj_general && !objetivos.startsWith(proyecto.obj_general)) {
    objetivos = proyecto.obj_general + (objetivos ? `\n${objetivos}` : '');
  }

  const form = {
    nombre_proponente: usuario?.nombre || '',
    apellido_proponente: usuario?.apellido || '',
    correo_proponente: usuario?.email || '',
    telefono_proponente: proyecto.telefono_proponente || '',
    estudiante_proponente: usuario?.rol === 'alumno' ? 'Sí' : 'No',
    docente_responsable: proyecto.docente_responsable || '',
    linea_id: lineaId,
    sublinea_id: sublineaId,
    fecha_inicio: toDateSql(proyecto.fecha_inicio) || '',
    fecha_fin: toDateSql(proyecto.fecha_fin) || '',
    hora: proyecto.hora_inicio || '',
    horas: proyecto.horas_asignadas != null ? String(proyecto.horas_asignadas) : '',
    unidad_academica_ids: unidadIds,
    carrera: proyecto.carrera_texto || '',
    curso: proyecto.curso || '',
    organizaciones: proyecto.involucrados || '',
    fundamentacion: proyecto.fundamentacion || '',
    objetivos,
    metodologia: proyecto.metodologia || '',
    metas: proyecto.metas || '',
    resultados: proyecto.resultados || '',
    recursos_humanos: proyecto.recursos_humanos || '',
    proponente: proyecto.proponente_actividad || '',
    beneficiarios: proyecto.beneficiarios || '',
    localizacion: proyecto.localizacion || '',
    presupuesto: presup.rows[0]?.descripcion || '',
    estado: proyecto.estado,
  };

  const crono = await client.query(
    `SELECT c.*, a.nombre AS actividad_nombre
     FROM cronograma c
     LEFT JOIN actividades a ON a.id = c.actividad_id
     WHERE c.proyecto_id=$1 ORDER BY c.id`,
    [proyecto.id]
  );
  crono.rows.forEach((fila, i) => {
    const n = i + 1;
    if (n > 7) return;
    form[`cronograma_actividad_${n}`] = fila.actividad_nombre || '';
    form[`cronograma_inicio_${n}`] = toDateSql(fila.fecha_inicio) || '';
    form[`cronograma_dias_${n}`] = fila.cantidad_dias != null ? String(fila.cantidad_dias) : '';
    form[`cronograma_hora_${n}`] = fila.hora_texto || '';
    form[`cronograma_fin_${n}`] = toDateSql(fila.fecha_fin) || '';
    form[`cronograma_credito_${n}`] = fila.horas_extension != null ? String(fila.horas_extension) : '';
  });

  return form;
}

async function guardarProyecto(body, usuario, accion, proyectoId = null) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userRow = (await client.query('SELECT * FROM usuarios WHERE id=$1', [usuario.id])).rows[0];
    if (!userRow) throw Object.assign(new Error('Usuario no encontrado'), { status: 401 });

    let existente = null;
    if (proyectoId) {
      existente = await obtenerProyectoEditable(client, proyectoId, usuario.id);
      if (!existente) {
        throw Object.assign(
          new Error('No puede editar este proyecto o ya no está disponible para cambios.'),
          { status: 403 }
        );
      }
    }

    const estado = estadoDesdeAccion(accion);
    const sublinea = await obtenerSublinea(client, body);
    await actualizarUsuarioProponente(client, body, userRow);
    const { objGeneral, objetivosCompletos } = dividirObjetivos(valor(body, 'objetivos'));
    const horas = valor(body, 'horas') ? Number(valor(body, 'horas')) : null;

    const campos = {
      denominacion: (sublinea.nombre || '').slice(0, 255),
      sublinea_id: sublinea.id,
      fecha_inicio: toDateSql(valor(body, 'fecha_inicio')),
      fecha_fin: toDateSql(valor(body, 'fecha_fin')),
      hora_inicio: valor(body, 'hora').slice(0, 5),
      horas_asignadas: horas,
      involucrados: valor(body, 'organizaciones'),
      fundamentacion: valor(body, 'fundamentacion'),
      obj_general: objGeneral,
      objetivos_especificos: objetivosCompletos,
      metodologia: valor(body, 'metodologia'),
      metas: valor(body, 'metas'),
      resultados: valor(body, 'resultados'),
      recursos_humanos: valor(body, 'recursos_humanos'),
      telefono_proponente: valor(body, 'telefono_proponente'),
      docente_responsable: esEstudiante(body) ? valor(body, 'docente_responsable') : '',
      beneficiarios: valor(body, 'beneficiarios'),
      localizacion: valor(body, 'localizacion'),
      estado,
      curso: valor(body, 'curso'),
      carrera_texto: valor(body, 'carrera'),
      proponente_actividad: valor(body, 'proponente'),
    };

    let proyecto;
    if (existente) {
      const upd = await client.query(
        `UPDATE proyectos SET
          denominacion=$1, sublinea_id=$2, fecha_inicio=$3, fecha_fin=$4, hora_inicio=$5,
          horas_asignadas=$6, involucrados=$7, fundamentacion=$8, obj_general=$9,
          objetivos_especificos=$10, metodologia=$11, metas=$12, resultados=$13,
          recursos_humanos=$14, telefono_proponente=$15, docente_responsable=$16,
          beneficiarios=$17, localizacion=$18, estado=$19, curso=$20, carrera_texto=$21,
          proponente_actividad=$22, actualizado_en=NOW()
         WHERE id=$23 RETURNING *`,
        [
          campos.denominacion, campos.sublinea_id, campos.fecha_inicio, campos.fecha_fin,
          campos.hora_inicio, campos.horas_asignadas, campos.involucrados, campos.fundamentacion,
          campos.obj_general, campos.objetivos_especificos, campos.metodologia, campos.metas,
          campos.resultados, campos.recursos_humanos, campos.telefono_proponente,
          campos.docente_responsable, campos.beneficiarios, campos.localizacion, campos.estado,
          campos.curso, campos.carrera_texto, campos.proponente_actividad, existente.id,
        ]
      );
      proyecto = upd.rows[0];
      await limpiarRelaciones(client, proyecto.id);
    } else {
      const ins = await client.query(
        `INSERT INTO proyectos (
          denominacion, sublinea_id, fecha_inicio, fecha_fin, hora_inicio, horas_asignadas,
          involucrados, fundamentacion, obj_general, objetivos_especificos, metodologia, metas,
          resultados, recursos_humanos, telefono_proponente, docente_responsable,
          beneficiarios, localizacion, estado, curso, carrera_texto, proponente_actividad, usuario_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)
        RETURNING *`,
        [
          campos.denominacion, campos.sublinea_id, campos.fecha_inicio, campos.fecha_fin,
          campos.hora_inicio, campos.horas_asignadas, campos.involucrados, campos.fundamentacion,
          campos.obj_general, campos.objetivos_especificos, campos.metodologia, campos.metas,
          campos.resultados, campos.recursos_humanos, campos.telefono_proponente,
          campos.docente_responsable, campos.beneficiarios, campos.localizacion, campos.estado,
          campos.curso, campos.carrera_texto, campos.proponente_actividad, usuario.id,
        ]
      );
      proyecto = ins.rows[0];
    }

    await guardarRelaciones(client, proyecto.id, body);
    await client.query('COMMIT');
    return { proyecto, estado };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function eliminarProyecto(proyectoId, usuarioId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const proyecto = await obtenerProyectoEditable(client, proyectoId, usuarioId);
    if (!proyecto) {
      throw Object.assign(new Error('No puede eliminar este proyecto o ya no está disponible.'), { status: 403 });
    }
    await limpiarRelaciones(client, proyecto.id);
    await client.query('DELETE FROM proyecto_revisiones WHERE proyecto_id=$1', [proyecto.id]);
    await client.query('DELETE FROM informes WHERE proyecto_id=$1', [proyecto.id]);
    await client.query('DELETE FROM proyectos WHERE id=$1', [proyecto.id]);
    await client.query('COMMIT');
    return proyecto.id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  guardarProyecto,
  eliminarProyecto,
  obtenerProyectoEditable,
  construirFormulario,
  EstadoProyecto,
};
