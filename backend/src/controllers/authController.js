const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const generateAccessToken = (user, sessionId) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email, rol: user.rol, sid: sessionId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '8h' }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

const login = async (req, res) => {
  try {
    const identificador = (req.body.identificador || req.body.username || req.body.email || '').trim();
    const { password } = req.body;

    if (!identificador || !password) {
      return res.status(400).json({ success: false, message: 'Usuario/email y contraseña requeridos' });
    }

    const result = await pool.query(
      `SELECT * FROM usuarios
       WHERE activo = TRUE AND (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1))
       LIMIT 1`,
      [identificador]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const refreshToken = generateRefreshToken(user);
    const resultToken = await pool.query(
      `INSERT INTO refresh_tokens (usuario_id, token, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days') RETURNING id`,
      [user.id, refreshToken]
    );

    const accessToken = generateAccessToken(user, resultToken.rows[0].id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const refresh = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      return res.status(401).json({ success: false, message: 'No hay refresh token' });
    }

    const dbToken = await pool.query('SELECT * FROM refresh_tokens WHERE token = $1', [oldRefreshToken]);
    if (!dbToken.rows.length) {
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Token no válido o ya utilizado' });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [oldRefreshToken]);
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Refresh token inválido o expirado' });
    }

    const result = await pool.query(
      'SELECT id, email, username, nombre, apellido, rol FROM usuarios WHERE id = $1 AND activo = TRUE',
      [decoded.id]
    );
    if (!result.rows.length) {
      return res.status(403).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [oldRefreshToken]);

    const newRefreshToken = generateRefreshToken(user);
    const resultToken = await pool.query(
      `INSERT INTO refresh_tokens (usuario_id, token, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days') RETURNING id`,
      [user.id, newRefreshToken]
    );

    const newAccessToken = generateAccessToken(user, resultToken.rows[0].id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, nombre, apellido, rol, creado_en FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

module.exports = { login, refresh, logout, getMe };
