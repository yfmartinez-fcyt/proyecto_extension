const { Client } = require('pg');
const { loadEnv } = require('./loadEnv');

loadEnv();

async function listTables(dbName) {
  const c = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
  });
  await c.connect();
  const t = await c.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`
  );
  await c.end();
  return t.rows.map((r) => r.tablename);
}

async function dropDb(dbName) {
  const admin = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });
  await admin.connect();
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
     WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [dbName]
  );
  await admin.query(`DROP DATABASE IF EXISTS "${dbName.replace(/"/g, '""')}"`);
  console.log('Eliminada:', dbName);
  await admin.end();
}

(async () => {
  const tables = await listTables('proyecto_extension');
  console.log(`proyecto_extension tiene ${tables.length} tablas:`);
  tables.forEach((t) => console.log(' -', t));
  const django = tables.filter((t) => /^(django_|auth_|usuarios_django)/i.test(t));
  console.log('Django en proyecto_extension:', django.length ? django.join(', ') : 'NINGUNA');

  if (django.length || tables.length > 20) {
    console.log('\nEs la base vieja. La elimino...');
    await dropDb('proyecto_extension');
  } else {
    console.log('\nNo hace falta borrar proyecto_extension.');
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
