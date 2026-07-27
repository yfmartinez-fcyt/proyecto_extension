const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rolMiddleware');


// Todas las rutas requieren autenticación
router.use(authMiddleware);


// Obtener usuarios (solo admin)
router.get(
  '/',
  authorize('admin'),
  usuarioController.getAllUsers
);


// Crear usuario (solo admin)
router.post(
  '/',
  authorize('admin'),
  usuarioController.createUser
);


// Obtener sesiones del sistema (solo admin)
router.get(
  '/sessions',
  authorize('admin'),
  usuarioController.getAllSessions
);


// Actualizar usuario
router.put(
  '/:id',
  usuarioController.updateUser
);


module.exports = router;