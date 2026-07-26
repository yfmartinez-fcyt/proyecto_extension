const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize, soloProponente } = require('../middleware/rolMiddleware');
const {
  listarMios,
  obtenerUno,
  crearOActualizar,
  eliminar,
  repositorio,
  detalleRepositorio,
} = require('../controllers/proyectoController');
const { ROLES_PROPONENTE } = require('../utils/constants');

const router = express.Router();

router.get('/repositorio', repositorio);
router.get('/repositorio/:id', detalleRepositorio);

router.use(authMiddleware);

router.get('/mios', authorize(ROLES_PROPONENTE), soloProponente, listarMios);
router.get('/:id', authorize(ROLES_PROPONENTE), soloProponente, obtenerUno);
router.post('/', authorize(ROLES_PROPONENTE), soloProponente, crearOActualizar);
router.put('/:id', authorize(ROLES_PROPONENTE), soloProponente, crearOActualizar);
router.delete('/:id', authorize(ROLES_PROPONENTE), soloProponente, eliminar);

module.exports = router;
