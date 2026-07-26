const EstadoProyecto = {
  BORRADOR: 'borrador',
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  SUGERENCIAS: 'sugerencias',
  RECHAZADO: 'rechazado',
  EDITABLES: ['borrador', 'pendiente', 'sugerencias'],
  REVISABLES_DIRECTOR: ['pendiente'],
  ETIQUETAS: {
    borrador: 'Borrador',
    pendiente: 'Pendiente de revisión',
    aprobado: 'Aprobado',
    sugerencias: 'Con sugerencias',
    rechazado: 'Rechazado',
  },
};

const AccionDirector = {
  APROBAR: 'aprobar',
  RECHAZAR: 'rechazar',
  OBSERVAR: 'observar',
  ESTADO_DESTINO: {
    aprobar: 'aprobado',
    rechazar: 'rechazado',
    observar: 'sugerencias',
  },
  REQUIERE_COMENTARIO: ['rechazar', 'observar'],
  ETIQUETAS: {
    aprobar: 'Aprobar',
    rechazar: 'Rechazar',
    observar: 'Observar (sugerencias)',
  },
};

const ROLES_PROPONENTE = ['alumno', 'docente', 'admin'];

module.exports = { EstadoProyecto, AccionDirector, ROLES_PROPONENTE };
