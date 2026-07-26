const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { loadEnv } = require('./loadEnv');
const { asegurarBaseDatos } = require('./ensure_db');

loadEnv();

function configDesdeEnv() {
  const password = (process.env.DB_PASSWORD || '').trim();
  const database = (process.env.DB_NAME || 'proyecto_extension').trim();
  const user = (process.env.DB_USER || 'postgres').trim();
  const host = (process.env.DB_HOST || 'localhost').trim();
  const port = Number(process.env.DB_PORT || 5432);

  if (!password || password === 'tu_password') {
    throw new Error('Configure DB_PASSWORD en backend/.env');
  }
  if (!database || database === 'postgres') {
    throw new Error('DB_NAME no puede ser vacío ni "postgres"');
  }
  return { host, port, database, user, password };
}

function quoteIdent(nombre) {
  return `"${String(nombre).replace(/"/g, '""')}"`;
}

async function resetDatabase() {
  const cfg = configDesdeEnv();
  const admin = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: 'postgres',
  });

  await admin.connect();
  try {
    await admin.query(
      `
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = $1 AND pid <> pg_backend_pid()
      `,
      [cfg.database]
    );

    const existe = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [cfg.database]
    );

    if (existe.rows.length > 0) {
      await admin.query(`DROP DATABASE ${quoteIdent(cfg.database)}`);
      console.log(`Base eliminada: ${cfg.database}`);
    }

    await admin.query(`CREATE DATABASE ${quoteIdent(cfg.database)}`);
    console.log(`Base creada limpia: ${cfg.database}`);
  } finally {
    await admin.end().catch(() => {});
  }

  await asegurarBaseDatos();

  const seedPath = path.join(__dirname, 'seed_users.js');
  if (fs.existsSync(seedPath)) {
    require('child_process').execFileSync(process.execPath, [seedPath], {
      stdio: 'inherit',
      env: process.env,
    });
  }

  console.log('Listo: base limpia sin tablas Django ni legacy.');
}

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[ERROR] ${err.message}`);
      process.exit(1);
    });
}

module.exports = { resetDatabase };
