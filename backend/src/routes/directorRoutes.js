const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rolMiddleware');
const {
  dashboard,
  revisionDetalle,
  revisionAccion,
} = require('../controllers/directorController');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize(['director_extension', 'admin']));

router.get('/', dashboard);
router.get('/revision/:id', revisionDetalle);
router.post('/revision/:id/accion', revisionAccion);

module.exports = router;
