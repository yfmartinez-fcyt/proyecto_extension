const { pool } = require('../config/db');
const {
  guardarProyecto,
  eliminarProyecto,
  construirFormulario,
  EstadoProyecto,
} = require('../utils/proyectoService');
const { historialRevisiones } = require('../utils/directorService');

const listarMios = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id, p.denominacion, p.estado, p.creado_en, p.actualizado_en, p.fecha_inicio,
              s.nombre AS sublinea
       FROM proyectos p
       LEFT JOIN sublineas s ON s.id = p.sublinea_id
       WHERE p.usuario_id = $1
       ORDER BY p.actualizado_en DESC`,
      [req.user.id]
    );

    const items = [];
    for (const row of r.rows) {
      let ultima = null;
      if (['sugerencias', 'rechazado'].includes(row.estado)) {
        const hist = await historialRevisiones(row.id, 1);
        ultima = hist[0] || null;
      }
      items.push({
        ...row,
        estado_etiqueta: EstadoProyecto.ETIQUETAS[row.estado] || row.estado,
        editable: EstadoProyecto.EDITABLES.includes(row.estado),
        ultima_revision: ultima,
      });
    }

    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al listar proyectos' });
  }
};

const obtenerUno = async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM proyectos WHERE id=$1 AND usuario_id=$2',
      [req.params.id, req.user.id]
    );
    if (!r.rows[0]) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    const form = await construirFormulario(pool, r.rows[0]);
    res.json({
      success: true,
      data: {
        id: r.rows[0].id,
        estado: r.rows[0].estado,
        editable: EstadoProyecto.EDITABLES.includes(r.rows[0].estado),
        formulario: form,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener proyecto' });
  }
};

const crearOActualizar = async (req, res) => {
  try {
    const accion = req.body.accion || 'borrador';
    const proyectoId = req.params.id || req.body.id || null;
    const { proyecto, estado } = await guardarProyecto(req.body, req.user, accion, proyectoId);
    res.json({
      success: true,
      message: estado === 'pendiente' ? 'Proyecto enviado a revisión' : 'Borrador guardado',
      data: { id: proyecto.id, estado },
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al guardar proyecto',
    });
  }
};

const eliminar = async (req, res) => {
  try {
    const id = await eliminarProyecto(Number(req.params.id), req.user.id);
    res.json({ success: true, message: 'Proyecto eliminado', data: { id } });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al eliminar',
    });
  }
};

const repositorio = async (req, res) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    let sql = `
      SELECT p.id, p.denominacion, p.estado, p.actualizado_en, p.beneficiarios, p.localizacion,
             s.nombre AS sublinea, l.nombre AS linea,
             u.nombre AS proponente_nombre, u.apellido AS proponente_apellido
      FROM proyectos p
      LEFT JOIN sublineas s ON s.id = p.sublinea_id
      LEFT JOIN lineas_accion l ON l.id = s.linea_id
      LEFT JOIN usuarios u ON u.id = p.usuario_id
      WHERE p.estado = 'aprobado'`;
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (
        LOWER(p.denominacion) LIKE $1 OR LOWER(COALESCE(s.nombre,'')) LIKE $1
        OR LOWER(COALESCE(l.nombre,'')) LIKE $1 OR LOWER(COALESCE(p.beneficiarios,'')) LIKE $1
      )`;
    }
    sql += ' ORDER BY p.actualizado_en DESC';
    const r = await pool.query(sql, params);
    res.json({ success: true, data: r.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en repositorio' });
  }
};

const detalleRepositorio = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, s.nombre AS sublinea, l.nombre AS linea,
              u.nombre AS proponente_nombre, u.apellido AS proponente_apellido, u.email AS proponente_correo
       FROM proyectos p
       LEFT JOIN sublineas s ON s.id = p.sublinea_id
       LEFT JOIN lineas_accion l ON l.id = s.linea_id
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id=$1 AND p.estado='aprobado'`,
      [req.params.id]
    );
    if (!r.rows[0]) {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado o no aprobado' });
    }
    const form = await construirFormulario(pool, r.rows[0]);
    const unidades = (
      await pool.query('SELECT nombre FROM proyecto_unidades_academicas WHERE proyecto_id=$1', [req.params.id])
    ).rows.map((u) => u.nombre);
    const cronograma = (
      await pool.query(
        `SELECT c.*, a.nombre AS actividad FROM cronograma c
         LEFT JOIN actividades a ON a.id=c.actividad_id WHERE c.proyecto_id=$1 ORDER BY c.id`,
        [req.params.id]
      )
    ).rows;

    res.json({
      success: true,
      data: {
        ...r.rows[0],
        unidades,
        cronograma,
        formulario: form,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al obtener detalle' });
  }
};

const dashboard = async(req,res)=>{
  try {

    const total = await pool.query(`
      SELECT COUNT(*) 
      FROM proyectos
      WHERE estado='aprobado'
    `);


    const anio = await pool.query(`
      SELECT COUNT(*)
      FROM proyectos
      WHERE estado='aprobado'
      AND EXTRACT(YEAR FROM actualizado_en)=EXTRACT(YEAR FROM CURRENT_DATE)
    `);


    const lineas = await pool.query(`
      SELECT 
        l.nombre,
        COUNT(p.id)::int AS cantidad
      FROM proyectos p
      INNER JOIN sublineas s
        ON s.id=p.sublinea_id
      INNER JOIN lineas_accion l
        ON l.id=s.linea_id
      WHERE p.estado='aprobado'
      GROUP BY l.nombre
      ORDER BY cantidad DESC
    `);


    const sublineas = await pool.query(`
      SELECT 
        l.nombre AS linea,
        s.nombre AS sublinea,
        COUNT(p.id)::int AS cantidad
      FROM proyectos p
      INNER JOIN sublineas s
        ON s.id=p.sublinea_id
      INNER JOIN lineas_accion l
        ON l.id=s.linea_id
      WHERE p.estado='aprobado'
      GROUP BY l.nombre,s.nombre
    `);



    const resultadoSub = {};

    sublineas.rows.forEach(item=>{

      if(!resultadoSub[item.linea]){
        resultadoSub[item.linea]=[];
      }

      resultadoSub[item.linea].push({
        nombre:item.sublinea,
        cantidad:item.cantidad
      });

    });



    res.json({
      success:true,
      data:{
        total_aprobados:Number(total.rows[0].count),
        aprobados_anio:Number(anio.rows[0].count),
        lineas:lineas.rows,
        sublineas:resultadoSub
      }
    });


  }catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:'Error al obtener dashboard'
    });

  }
};

module.exports = {
  listarMios,
  obtenerUno,
  crearOActualizar,
  eliminar,
  repositorio,
  detalleRepositorio,
  dashboard
};
