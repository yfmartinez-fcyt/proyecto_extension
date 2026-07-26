const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se proporcionó un token.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.sid) {
      const sessionCheck = await pool.query(
        'SELECT id FROM refresh_tokens WHERE id = $1',
        [decoded.sid]
      );
      if (sessionCheck.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Sesión revocada o cerrada remotamente.',
          revoked: true,
        });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
        expired: true,
      });
    }
    return res.status(403).json({ success: false, message: 'Token no válido' });
  }
};

module.exports = authMiddleware;
