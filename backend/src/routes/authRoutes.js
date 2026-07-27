const express = require('express');
const { login, refresh, logout, getMe, register } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;
