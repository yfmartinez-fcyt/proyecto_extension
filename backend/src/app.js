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



/**
 * Configuración CORS
 */
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL
    .split(',')
    .map(origin => origin.trim())
  : ['http://localhost:5173'];



app.use(
  cors({
    origin: (origin, callback) => {

      // Permite Postman, pruebas internas, etc.
      if (!origin) {
        return callback(null, true);
      }


      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }


      console.error(
        `CORS bloqueado para origen: ${origin}`
      );

      callback(
        new Error('Origen no permitido por CORS')
      );
    },


    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],


    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],


    credentials: true
  })
);




/**
 * Middlewares globales
 */
app.use(express.json({
  limit: '2mb'
}));

app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true
  })
);





/**
 * Health check
 */
app.get('/api/health', async (req, res) => {

  try {

    await pool.query('SELECT 1');


    res.json({
      success: true,
      status: 'online',
      database: 'connected',
      environment:
        process.env.NODE_ENV || 'development',
      timestamp:
        new Date().toISOString()
    });


  } catch (error) {

    res.status(503).json({

      success: false,
      status: 'error',

      message:
        'Error de conexión con la base de datos',

      error: error.message,

      timestamp:
        new Date().toISOString()
    });

  }

});





/**
 * Rutas API
 */
app.use(
  '/api/auth',
  authRoutes
);


app.use(
  '/api/catalogo',
  catalogoRoutes
);


app.use(
  '/api/proyectos',
  proyectoRoutes
);


app.use(
  '/api/director',
  directorRoutes
);


app.use(
  '/api/usuarios',
  usuarioRoutes
);


app.use(
  '/api',
  extraRoutes
);





/**
 * Servir frontend en producción
 */
if (process.env.NODE_ENV === 'production') {

  const distPath =
    path.join(
      __dirname,
      '../../frontend/dist'
    );


  app.use(
    express.static(distPath)
  );


  app.get(
    /^(?!\/api).*/,
    (req, res) => {
      res.sendFile(
        path.join(
          distPath,
          'index.html'
        )
      );
    }
  );

}





/**
 * Ruta no encontrada
 */
app.use((req, res) => {

  res.status(404).json({

    success: false,

    message:
      `Ruta '${req.originalUrl}' no encontrada`

  });

});





/**
 * Middleware global de errores
 */
app.use(errorHandler);



module.exports = app;