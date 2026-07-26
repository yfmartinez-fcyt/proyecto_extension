/**
 * Crea la base (si no existe) y aplica database/schema.sql.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { loadEnv } = require('./loadEnv');

loadEnv();

const SCHEMA_PATH = path.join(__dirname, 'database', 'schema.sql');

function configDesdeEnv() {
  const password = (process.env.DB_PASSWORD || '').trim();
  const database = (process.env.DB_NAME || 'proyecto_extension').trim();
  const user = (process.env.DB_USER || 'postgres').trim();
  const host = (process.env.DB_HOST || 'localhost').trim();
  const port = Number(process.env.DB_PORT || 5432);

  if (!password || password === 'tu_password' || password === 'TU_PASSWORD') {
    throw new Error(
      'Falta la contraseña real de PostgreSQL en backend\\.env\n' +
        '  Edite DB_PASSWORD=... (no deje tu_password) y vuelva a intentar.'
    );
  }

  return { host, port, database, user, password };
}

function enunciadosSql(texto) {
  const sinComentarios = texto
    .split(/\r?\n/)
    .map((linea) => linea.replace(/--.*$/, ''))
    .join('\n');

  return sinComentarios
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

function quoteIdent(nombre) {
  return `"${String(nombre).replace(/"/g, '""')}"`;
}

/**
 * @param {{ quiet?: boolean }} [opts]
 */
async function asegurarBaseDatos(opts = {}) {
  const quiet = Boolean(opts.quiet);
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  const cfg = configDesdeEnv();

  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`No se encontró el esquema SQL:\n  ${SCHEMA_PATH}`);
  }

  const admin = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: 'postgres',
  });

  try {
    await admin.connect();
    const existe = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [cfg.database]
    );
    if (existe.rows.length === 0) {
      await admin.query(`CREATE DATABASE ${quoteIdent(cfg.database)}`);
      log(`Base creada: ${cfg.database}`);
    } else {
      log(`Base ya existe: ${cfg.database}`);
    }
  } finally {
    await admin.end().catch(() => {});
  }

  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
  });

  try {
    await client.connect();
    const texto = fs.readFileSync(SCHEMA_PATH, 'utf8');
    for (const enunciado of enunciadosSql(texto)) {
      await client.query(enunciado);
    }
    log(`Esquema aplicado: ${SCHEMA_PATH}`);
  } finally {
    await client.end().catch(() => {});
  }

  return cfg.database;
}

module.exports = { asegurarBaseDatos };

if (require.main === module) {
  asegurarBaseDatos()
    .then((nombre) => {
      console.log(`Base lista: ${nombre}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[ERROR] ${err.message}`);
      process.exit(1);
    });
}
