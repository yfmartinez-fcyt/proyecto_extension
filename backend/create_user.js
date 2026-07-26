/**
 * Crea o actualiza un usuario en la base.
 *
 * Uso:
 *   node create_user.js --email=casco@fctunca.edu.py --password=CarlosCasco12345
 *   node create_user.js --email=x@fctunca.edu.py --password=Secreta123 --rol=docente --nombre=Ana --apellido=Pérez
 *
 * Roles: alumno | docente | director_extension | admin
 * Si no pasás --username, se usa la parte antes de @ del email.
 */
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { loadEnv } = require('./loadEnv');

loadEnv();

function parseArgs(argv) {
  const out = {};
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    if (eq === -1) {
      out[raw.slice(2)] = true;
      continue;
    }
    out[raw.slice(2, eq)] = raw.slice(eq + 1);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = String(args.email || '').trim().toLowerCase();
  const password = String(args.password || '');
  const rolesOk = ['alumno', 'docente', 'director_extension', 'admin'];
  const rol = String(args.rol || 'alumno').trim();
  const username = String(args.username || email.split('@')[0] || '')
    .trim()
    .toLowerCase();
  const nombre = String(args.nombre || '').trim();
  const apellido = String(args.apellido || '').trim();

  if (!email || !password) {
    console.error(
      'Faltan datos. Ejemplo:\n  node create_user.js --email=casco@fctunca.edu.py --password=CarlosCasco12345 --rol=docente'
    );
    process.exit(1);
  }
  if (!rolesOk.includes(rol)) {
    console.error(`Rol inválido. Usá uno de: ${rolesOk.join(', ')}`);
    process.exit(1);
  }
  if (!username) {
    console.error('No se pudo derivar username. Pasá --username=...');
    process.exit(1);
  }

  const dbPassword = (process.env.DB_PASSWORD || '').trim();
  if (!dbPassword || dbPassword === 'tu_password') {
    throw new Error('Configure DB_PASSWORD en backend/.env');
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'proyecto_extension',
    user: process.env.DB_USER || 'postgres',
    password: dbPassword,
  });

  await client.connect();
  try {
    const hash = await bcrypt.hash(password, 10);
    const exists = await client.query(
      'SELECT id FROM usuarios WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (exists.rows.length) {
      const r = await client.query(
        `UPDATE usuarios
         SET password_hash = $1,
             email = $2,
             username = $3,
             nombre = COALESCE(NULLIF($4, ''), nombre),
             apellido = COALESCE(NULLIF($5, ''), apellido),
             rol = $6,
             activo = TRUE
         WHERE id = $7
         RETURNING id, email, username, nombre, apellido, rol`,
        [hash, email, username, nombre, apellido, rol, exists.rows[0].id]
      );
      console.log('Usuario actualizado:');
      console.log(r.rows[0]);
    } else {
      const r = await client.query(
        `INSERT INTO usuarios (email, username, password_hash, nombre, apellido, rol)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, username, nombre, apellido, rol`,
        [email, username, hash, nombre || username, apellido || '', rol]
      );
      console.log('Usuario creado:');
      console.log(r.rows[0]);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
