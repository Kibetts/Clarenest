const express = require('express');
const feeManagementController = require('../controller/feePayment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/record-payment')
    .post(authorizeRoles(ROLES.ADMIN), feeManagementController.recordPayment);

router
    .route('/grant-temporary-access')
    .post(authorizeRoles(ROLES.ADMIN), feeManagementController.grantTemporaryAccess);

router
    .route('/payment-history/:studentId')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT), feeManagementController.getPaymentHistory);

module.exports = router;