const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rolMiddleware');
const { listar, crear } = require('../controllers/usuarioController');

const router = express.Router();
router.use(authMiddleware);
router.use(authorize('admin'));
router.get('/', listar);
router.post('/', crear);

module.exports = router;
