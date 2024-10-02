const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, notificationController.getAllNotifications);
router.get('/:id', authMiddleware, notificationController.getNotificationById);
router.post('/', authMiddleware, notificationController.createNotification);
router.put('/:id', authMiddleware, notificationController.updateNotification);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);

module.exports = router;
