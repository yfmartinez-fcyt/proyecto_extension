const express = require('express');
const { login, refresh, logout, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
