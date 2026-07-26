const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize, soloProponente } = require('../middleware/rolMiddleware');
const {
  crearTicket,
  listarProyectosAprobadosUsuario,
  crearInforme,
} = require('../controllers/informeSoporteController');
const { ROLES_PROPONENTE } = require('../utils/constants');

const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads', 'evidencias');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();

router.post('/soporte', crearTicket);

router.get(
  '/informes/proyectos-aprobados',
  authMiddleware,
  authorize(ROLES_PROPONENTE),
  soloProponente,
  listarProyectosAprobadosUsuario
);

router.post(
  '/informes',
  authMiddleware,
  authorize(ROLES_PROPONENTE),
  soloProponente,
  upload.array('evidencias', 10),
  crearInforme
);

module.exports = router;
