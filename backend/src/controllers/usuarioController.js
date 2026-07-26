const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const listar = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, email, username, nombre, apellido, rol, activo, creado_en
       FROM usuarios ORDER BY id`
    );
    res.json({ success: true, data: r.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al listar usuarios' });
  }
};

const crear = async (req, res) => {
  try {
    const { email, username, password, nombre, apellido, rol } = req.body;
    const rolesOk = ['alumno', 'docente', 'director_extension', 'admin'];
    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'email, username y password son requeridos' });
    }
    if (rol && !rolesOk.includes(rol)) {
      return res.status(400).json({ success: false, message: 'Rol no válido' });
    }
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO usuarios (email, username, password_hash, nombre, apellido, rol)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, email, username, nombre, apellido, rol`,
      [email.trim(), username.trim(), hash, nombre || '', apellido || '', rol || 'alumno']
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Email o username ya existe' });
    }
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
};

module.exports = { listar, crear };
