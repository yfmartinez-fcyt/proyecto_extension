/**
 * Crea usuarios demo si no existen.
 * Contraseña por defecto: demo123
 */
const path = require('path');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { loadEnv } = require('./loadEnv');

loadEnv();

const USERS = [
  { email: 'admin@fctunca.edu.py', username: 'admin', nombre: 'Admin', apellido: 'Sistema', rol: 'admin' },
  { email: 'director@fctunca.edu.py', username: 'director', nombre: 'Director', apellido: 'Extensión', rol: 'director_extension' },
  { email: 'alumno@fctunca.edu.py', username: 'alumno', nombre: 'Alumno', apellido: 'Demo', rol: 'alumno' },
  { email: 'docente@fctunca.edu.py', username: 'docente', nombre: 'Docente', apellido: 'Demo', rol: 'docente' },
];

/**
 * @param {{ quiet?: boolean }} [opts]
 */
async function seedUsers(opts = {}) {
  const quiet = Boolean(opts.quiet);
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  const password = (process.env.DB_PASSWORD || '').trim();
  if (!password || password === 'tu_password') {
    throw new Error('Configure DB_PASSWORD en backend/.env');
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'proyecto_extension',
    user: process.env.DB_USER || 'postgres',
    password,
  });

  await client.connect();
  try {
    const hash = await bcrypt.hash('demo123', 10);
    let created = 0;

    for (const u of USERS) {
      const exists = await client.query(
        'SELECT id FROM usuarios WHERE email = $1 OR username = $2',
        [u.email, u.username]
      );
      if (exists.rows.length) continue;

      await client.query(
        `INSERT INTO usuarios (email, username, password_hash, nombre, apellido, rol)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.email, u.username, hash, u.nombre, u.apellido, u.rol]
      );
      created += 1;
      log(`Creado: ${u.username} / demo123 (${u.rol})`);
    }

    if (!quiet && created === 0) {
      log('Usuarios demo ya presentes.');
    }
  } finally {
    await client.end();
  }
}

module.exports = { seedUsers };

if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
