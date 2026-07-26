const { loadEnv } = require('../loadEnv');
loadEnv();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const directorRoutes = require('./routes/directorRoutes');
const extraRoutes = require('./routes/extraRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      status: 'online',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      message: 'Error de conexión con la base de datos',
      error: error.message,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/director', directorRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', extraRoutes);

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta '${req.originalUrl}' no encontrada`,
  });
});

app.use(errorHandler);

module.exports = app;
