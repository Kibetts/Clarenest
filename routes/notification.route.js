const express = require('express');
const notificationController = require('../controller/notification.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(notificationController.getUserNotifications)
    .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), notificationController.createNotification);

router
    .route('/:id')
    .get(notificationController.getNotification)
    .patch(notificationController.markNotificationAsRead)
    .delete(authorizeRoles(ROLES.ADMIN), notificationController.deleteNotification);

module.exports = router;