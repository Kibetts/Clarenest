const express = require('express');
const userController = require('../controller/user.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();


router.post('/heartbeat', authenticateJWT, userController.updateUserStatus);
router.use(authenticateJWT);

router.get('/me', userController.getMe);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN), userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(authorizeRoles(ROLES.ADMIN), userController.updateUser)
    .delete(authorizeRoles(ROLES.ADMIN), userController.deleteUser);

router
    .route('/:userId/update-fee-status')
    .patch(authorizeRoles(ROLES.ADMIN), userController.updateFeeStatus);

module.exports = router;