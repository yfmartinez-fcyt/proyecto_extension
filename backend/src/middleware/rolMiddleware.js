const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.rol))) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos suficientes para acceder a este recurso.',
      });
    }
    next();
  };
};

/** Bloquea al director del portal proponente (como @solo_proponente). */
const soloProponente = (req, res, next) => {
  if (req.user?.rol === 'director_extension') {
    return res.status(403).json({
      success: false,
      message: 'El director debe usar el portal de extensión.',
      redirect: '/director',
    });
  }
  next();
};

module.exports = { authorize, soloProponente };
