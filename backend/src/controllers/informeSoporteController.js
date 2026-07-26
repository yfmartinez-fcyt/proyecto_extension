const path = require('path');
const { pool } = require('../config/db');

const crearTicket = async (req, res) => {
  try {
    const nombre = (req.body.nombre || '').trim();
    const email = (req.body.email || '').trim();
    const asunto = (req.body.asunto || '').trim();
    const mensaje = (req.body.mensaje || '').trim();

    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'Complete nombre, email, asunto y mensaje',
      });
    }

    const r = await pool.query(
      `INSERT INTO tickets_soporte (usuario_id, nombre, email, asunto, mensaje)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, creado_en`,
      [req.user?.id || null, nombre, email, asunto, mensaje]
    );

    res.json({
      success: true,
      message: 'Ticket registrado. Nos contactaremos pronto.',
      data: r.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al enviar soporte' });
  }
};

const listarProyectosAprobadosUsuario = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, denominacion FROM proyectos
       WHERE usuario_id=$1 AND estado='aprobado'
       ORDER BY denominacion`,
      [req.user.id]
    );
    res.json({ success: true, data: r.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar proyectos' });
  }
};

const crearInforme = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      proyecto_id,
      semestre,
      tema,
      fecha_inicio,
      fecha_fin,
      tiempo_duracion,
      medios_utilizados,
      descripcion,
      logros_obtenidos,
      dificultades,
      modalidad,
      recomendaciones,
    } = req.body;

    if (!proyecto_id || !tema) {
      return res.status(400).json({
        success: false,
        message: 'Proyecto y tema son obligatorios',
      });
    }

    const proy = await client.query(
      `SELECT id FROM proyectos WHERE id=$1 AND usuario_id=$2 AND estado='aprobado'`,
      [Number(proyecto_id), req.user.id]
    );
    if (!proy.rows[0]) {
      return res.status(403).json({
        success: false,
        message: 'Solo puede informar sobre proyectos propios aprobados',
      });
    }

    await client.query('BEGIN');
    const inf = await client.query(
      `INSERT INTO informes (
        proyecto_id, usuario_id, semestre, tema, fecha_inicio, fecha_fin,
        tiempo_duracion, medios_utilizados, descripcion, logros_obtenidos,
        dificultades, modalidad, recomendaciones
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        Number(proyecto_id),
        req.user.id,
        semestre || '',
        tema,
        fecha_inicio || null,
        fecha_fin || null,
        tiempo_duracion || '',
        medios_utilizados || '',
        descripcion || '',
        logros_obtenidos || '',
        dificultades || '',
        modalidad || '',
        recomendaciones || '',
      ]
    );

    const informe = inf.rows[0];
    const files = req.files || [];
    for (const file of files) {
      await client.query(
        `INSERT INTO evidencias (informe_id, tipo_archivo, nombre_archivo, ruta_archivo)
         VALUES ($1,$2,$3,$4)`,
        [
          informe.id,
          path.extname(file.originalname).replace('.', '') || 'file',
          file.originalname,
          file.filename,
        ]
      );
    }

    await client.query('COMMIT');
    res.json({
      success: true,
      message: 'Informe presentado correctamente',
      data: { id: informe.id },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al guardar informe' });
  } finally {
    client.release();
  }
};

module.exports = {
  crearTicket,
  listarProyectosAprobadosUsuario,
  crearInforme,
};
