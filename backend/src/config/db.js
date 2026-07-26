const path = require('path');
const { Pool } = require('pg');
const { loadEnv } = require('../../loadEnv');

loadEnv();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

const connectDB = async (opts = {}) => {
  const client = await pool.connect();
  if (!opts.quiet) console.log('Conectado a la base de datos.');
  client.release();
};

module.exports = { pool, connectDB };
