const express = require('express');
const { obtenerCatalogo } = require('../controllers/catalogoController');

const router = express.Router();
router.get('/', obtenerCatalogo);

module.exports = router;
