const { pool } = require('../config/db');
const { EstadoProyecto, AccionDirector } = require('./constants');
const { construirFormulario } = require('./proyectoService');

async function listarPendientes() {
  const r = await pool.query(
    `SELECT p.*,
       u.nombre AS proponente_nombre, u.apellido AS proponente_apellido, u.email AS proponente_correo,
       s.nombre AS sublinea_nombre, l.nombre AS linea_nombre
     FROM proyectos p
     LEFT JOIN usuarios u ON u.id = p.usuario_id
     LEFT JOIN sublineas s ON s.id = p.sublinea_id
     LEFT JOIN lineas_accion l ON l.id = s.linea_id
     WHERE p.estado = ANY($1::text[])
     ORDER BY p.actualizado_en DESC, p.id DESC`,
    [EstadoProyecto.REVISABLES_DIRECTOR]
  );
  return r.rows;
}

async function contarPendientes() {
  const r = await pool.query(
    'SELECT COUNT(*)::int AS total FROM proyectos WHERE estado = ANY($1::text[])',
    [EstadoProyecto.REVISABLES_DIRECTOR]
  );
  return r.rows[0].total;
}

async function obtenerParaRevision(proyectoId) {
  const r = await pool.query(
    `SELECT p.* FROM proyectos p
     WHERE p.id=$1 AND p.estado = ANY($2::text[])`,
    [proyectoId, EstadoProyecto.REVISABLES_DIRECTOR]
  );
  return r.rows[0] || null;
}

async function historialRevisiones(proyectoId, limite = null) {
  const params = [proyectoId];
  let sql = `
    SELECT r.*, u.nombre AS director_nombre, u.apellido AS director_apellido, u.username AS director_username
    FROM proyecto_revisiones r
    LEFT JOIN usuarios u ON u.id = r.director_id
    WHERE r.proyecto_id=$1
    ORDER BY r.creado_en DESC, r.id DESC`;
  if (limite) {
    sql += ` LIMIT $2`;
    params.push(limite);
  }
  const r = await pool.query(sql, params);
  return r.rows.map((rev) => ({
    id: rev.id,
    accion: rev.accion,
    accion_etiqueta: AccionDirector.ETIQUETAS[rev.accion] || rev.accion,
    comentario: rev.comentario || '',
    estado_anterior: rev.estado_anterior,
    estado_nuevo: rev.estado_nuevo,
    estado_nuevo_etiqueta: EstadoProyecto.ETIQUETAS[rev.estado_nuevo] || rev.estado_nuevo,
    director: [rev.director_nombre, rev.director_apellido].filter(Boolean).join(' ') || rev.director_username || '—',
    fecha: rev.creado_en,
  }));
}

async function construirContextoRevision(proyecto) {
  const form = await construirFormulario(pool, proyecto);
  const usuario = proyecto.usuario_id
    ? (
        await pool.query(
          'SELECT nombre, apellido, username, email, rol FROM usuarios WHERE id=$1',
          [proyecto.usuario_id]
        )
      ).rows[0]
    : null;

  const sub = proyecto.sublinea_id
    ? (await pool.query(
        `SELECT s.nombre AS sublinea, l.nombre AS linea FROM sublineas s
         JOIN lineas_accion l ON l.id=s.linea_id WHERE s.id=$1`,
        [proyecto.sublinea_id]
      )).rows[0]
    : null;

  const unidades = (
    await pool.query('SELECT nombre FROM proyecto_unidades_academicas WHERE proyecto_id=$1', [proyecto.id])
  ).rows.map((u) => u.nombre);

  const cronograma = (
    await pool.query(
      `SELECT c.*, a.nombre AS actividad FROM cronograma c
       LEFT JOIN actividades a ON a.id=c.actividad_id
       WHERE c.proyecto_id=$1 ORDER BY c.id`,
      [proyecto.id]
    )
  ).rows.map((item) => ({
    actividad: item.actividad || '—',
    fecha_inicio: item.fecha_inicio ? String(item.fecha_inicio).slice(0, 10) : '',
    fecha_fin: item.fecha_fin ? String(item.fecha_fin).slice(0, 10) : '',
    dias: item.cantidad_dias,
    horas: item.horas_extension,
  }));

  const tipoRol = {
    alumno: 'Alumno',
    docente: 'Docente',
    director_extension: 'Director',
    admin: 'Administrador',
  };

  return {
    id: proyecto.id,
    titulo: proyecto.denominacion || `Proyecto #${proyecto.id}`,
    estado: proyecto.estado,
    estado_etiqueta: EstadoProyecto.ETIQUETAS[proyecto.estado] || proyecto.estado,
    fecha_envio: proyecto.actualizado_en,
    proponente_nombre: usuario
      ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.email || usuario.username
      : '—',
    proponente_correo: usuario?.email || '',
    proponente_tipo: tipoRol[usuario?.rol] || usuario?.rol || '',
    cuenta: usuario
      ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.username
      : '',
    linea: sub?.linea || '',
    sublinea: sub?.sublinea || '',
    unidades,
    formulario: form,
    presupuesto: form.presupuesto || '',
    cronograma,
    historial: await historialRevisiones(proyecto.id),
  };
}

function validarAccion(accion, comentario) {
  if (!AccionDirector.ESTADO_DESTINO[accion]) {
    throw Object.assign(new Error('Acción de revisión no válida.'), { status: 400 });
  }
  const c = (comentario || '').trim();
  if (AccionDirector.REQUIERE_COMENTARIO.includes(accion) && !c) {
    throw Object.assign(
      new Error('Debe indicar un comentario institucional para rechazar u observar el proyecto.'),
      { status: 400 }
    );
  }
  if (c.length > 5000) {
    throw Object.assign(new Error('El comentario no puede superar los 5000 caracteres.'), { status: 400 });
  }
  return c;
}

async function ejecutarRevision(proyectoId, directorId, accion, comentario) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const r = await client.query(
      `SELECT * FROM proyectos WHERE id=$1 AND estado = ANY($2::text[]) FOR UPDATE`,
      [proyectoId, EstadoProyecto.REVISABLES_DIRECTOR]
    );
    const proyecto = r.rows[0];
    if (!proyecto) {
      throw Object.assign(
        new Error('El proyecto no está disponible para revisión o ya fue dictaminado.'),
        { status: 404 }
      );
    }

    const comentarioOk = validarAccion(accion, comentario);
    const estadoAnterior = proyecto.estado || EstadoProyecto.PENDIENTE;
    const estadoNuevo = AccionDirector.ESTADO_DESTINO[accion];

    await client.query(
      'UPDATE proyectos SET estado=$1, actualizado_en=NOW() WHERE id=$2',
      [estadoNuevo, proyecto.id]
    );

    const rev = await client.query(
      `INSERT INTO proyecto_revisiones
        (proyecto_id, director_id, accion, comentario, estado_anterior, estado_nuevo)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [proyecto.id, directorId, accion, comentarioOk, estadoAnterior, estadoNuevo]
    );

    await client.query('COMMIT');
    return { proyecto: { ...proyecto, estado: estadoNuevo }, revision: rev.rows[0], estadoNuevo };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  listarPendientes,
  contarPendientes,
  obtenerParaRevision,
  construirContextoRevision,
  ejecutarRevision,
  historialRevisiones,
};
