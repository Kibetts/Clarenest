const express = require('express');
const router = express.Router();
const feePaymentController = require('../controller/feePayment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

// All routes require authentication
router.use(authenticateJWT);

// Record payment - Admin only
router.post('/record-payment', 
    authorizeRoles(ROLES.ADMIN), 
    feePaymentController.recordPayment
);

// Grant temporary access - Admin only
router.post('/grant-temporary-access', 
    authorizeRoles(ROLES.ADMIN), 
    feePaymentController.grantTemporaryAccess
);

// Get payment history - Available to admin, student (their own), and parent (their children)
router.get('/payment-history/:studentId?', 
    authorizeRoles(ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT), 
    feePaymentController.getPaymentHistory
);

// Get all payment history - Admin only
router.get('/payment-history', 
    authorizeRoles(ROLES.ADMIN), 
    feePaymentController.getPaymentHistory
);

module.exports = router;