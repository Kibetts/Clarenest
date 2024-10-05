const express = require('express');
const { signup, login, profile, logout } = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

// router.get('/profile', authenticateJWT, profile);

router.post('/logout', logout);

module.exports = router;
