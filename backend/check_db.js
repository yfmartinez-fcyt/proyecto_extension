const { Client } = require('pg');
const path = require('path');
const { loadEnv } = require('./loadEnv');

loadEnv();

async function main() {
  const base = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  const admin = new Client({ ...base, database: 'postgres' });
  await admin.connect();
  const dbs = await admin.query(
    `SELECT datname FROM pg_database
     WHERE datname ILIKE '%proyecto%' OR datname ILIKE '%extension%'
     ORDER BY 1`
  );
  console.log('DB_NAME .env =', process.env.DB_NAME);
  console.log('Bases relacionadas =', dbs.rows.map((r) => r.datname).join(', ') || '(ninguna)');
  await admin.end();

  const dbName = process.env.DB_NAME;
  const c = new Client({ ...base, database: dbName });
  await c.connect();
  const t = await c.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`
  );
  console.log(`\nTablas en "${dbName}" (${t.rows.length}):`);
  for (const row of t.rows) console.log(' -', row.tablename);

  const django = t.rows.filter((r) =>
    /^(django_|auth_|usuarios_django)/i.test(r.tablename)
  );
  console.log(
    '\nTablas Django:',
    django.length ? django.map((r) => r.tablename).join(', ') : 'NINGUNA'
  );
  await c.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
