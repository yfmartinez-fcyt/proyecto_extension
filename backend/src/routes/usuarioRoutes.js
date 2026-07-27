const express = require('express');

const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rolMiddleware');


// Todas las rutas requieren autenticación
router.use(authMiddleware);


// Perfil actual
router.get(
  '/me',
  usuarioController.getMyProfile
);


// Admin lista usuarios
router.get(
  '/',
  authorize('admin'),
  usuarioController.getAllUsers
);


// Admin crea usuarios
router.post(
  '/',
  authorize('admin'),
  usuarioController.createUser
);


// Admin ve sesiones
router.get(
  '/sessions',
  authorize('admin'),
  usuarioController.getAllSessions
);


// Usuario actualiza su perfil o admin actualiza usuarios
router.put(
  '/:id',
  usuarioController.updateUser
);

module.exports = router;