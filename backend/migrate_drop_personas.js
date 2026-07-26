/**
 * Elimina tablas redundantes personas / tipos_persona.
 * El proponente queda solo en usuarios (vía proyectos.usuario_id).
 *
 * Uso: node migrate_drop_personas.js
 */
const { Client } = require('pg');
const { loadEnv } = require('./loadEnv');

loadEnv();

async function main() {
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
    await client.query('BEGIN');

    // Quitar FKs / columnas que apuntan a personas
    await client.query('ALTER TABLE proyectos DROP CONSTRAINT IF EXISTS proyectos_persona_id_fkey');
    await client.query('ALTER TABLE proyectos DROP COLUMN IF EXISTS persona_id');
    await client.query('ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_persona_id_fkey');
    await client.query('ALTER TABLE usuarios DROP COLUMN IF EXISTS persona_id');

    await client.query('DROP TABLE IF EXISTS personas CASCADE');
    await client.query('DROP TABLE IF EXISTS tipos_persona CASCADE');

    await client.query('COMMIT');
    console.log('OK: personas y tipos_persona eliminadas. Queda solo usuarios.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
