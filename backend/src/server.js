const { loadEnv } = require('../loadEnv');
loadEnv();

const app = require('./app');
const { connectDB } = require('./config/db');
const { asegurarBaseDatos } = require('../ensure_db');
const { seedUsers } = require('../seed_users');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await asegurarBaseDatos({ quiet: true });
    await connectDB({ quiet: true });
    await seedUsers({ quiet: true });
    app.listen(PORT, HOST, () => {
      console.log(`API lista en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error.message || error);
    process.exit(1);
  }
};

startServer();
