const { pool } = require('../config/db');

const obtenerCatalogo = async (req, res) => {
  try {
    const lineasRaw = await pool.query('SELECT id, nombre FROM lineas_accion ORDER BY nombre');
    const lineas = [];
    for (const linea of lineasRaw.rows) {
      const subs = await pool.query(
        'SELECT id, nombre FROM sublineas WHERE linea_id=$1 ORDER BY nombre',
        [linea.id]
      );
      lineas.push({
        id: linea.id,
        nombre: linea.nombre,
        sublineas: subs.rows.map((s) => ({
          id: s.id,
          nombre: (s.nombre || '').slice(0, 200),
        })),
      });
    }
    const unidades = await pool.query('SELECT id, nombre FROM facultades ORDER BY nombre');
    res.json({
      success: true,
      data: {
        lineas,
        unidades: unidades.rows,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al cargar catálogo' });
  }
};

module.exports = { obtenerCatalogo };
