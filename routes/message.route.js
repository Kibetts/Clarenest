const express = require('express');
const router = express.Router();
const messageController = require('../controller/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware.authenticateJWT, messageController.sendMessage);
router.get('/', authMiddleware.authenticateJWT, messageController.getMessages);
router.put('/:id/read', authMiddleware.authenticateJWT, messageController.markAsRead);

module.exports = router;