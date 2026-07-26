const {
  listarPendientes,
  contarPendientes,
  obtenerParaRevision,
  construirContextoRevision,
  ejecutarRevision,
} = require('../utils/directorService');

const dashboard = async (req, res) => {
  try {
    const [pendientes, total] = await Promise.all([listarPendientes(), contarPendientes()]);
    res.json({
      success: true,
      data: {
        total_pendientes: total,
        proyectos: pendientes.map((p) => ({
          id: p.id,
          denominacion: p.denominacion,
          estado: p.estado,
          actualizado_en: p.actualizado_en,
          carrera: p.carrera_texto || '',
          linea: p.linea_nombre,
          sublinea: p.sublinea_nombre,
          proponente: `${p.proponente_nombre || ''} ${p.proponente_apellido || ''}`.trim() || p.proponente_correo,
          proponente_correo: p.proponente_correo || '',
        })),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error en dashboard' });
  }
};

const revisionDetalle = async (req, res) => {
  try {
    const proyecto = await obtenerParaRevision(Number(req.params.id));
    if (!proyecto) {
      return res.status(404).json({
        success: false,
        message: 'El proyecto no está disponible para revisión',
      });
    }
    const data = await construirContextoRevision(proyecto);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al cargar revisión' });
  }
};

const revisionAccion = async (req, res) => {
  try {
    const { accion, comentario } = req.body;
    const result = await ejecutarRevision(
      Number(req.params.id),
      req.user.id,
      accion,
      comentario
    );
    res.json({
      success: true,
      message: `Proyecto ${result.estadoNuevo}`,
      data: {
        id: result.proyecto.id,
        estado: result.estadoNuevo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al dictaminar',
    });
  }
};

module.exports = { dashboard, revisionDetalle, revisionAccion };
