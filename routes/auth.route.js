const express = require('express');
const authController = require('../controller/auth.controller');
const applicationController = require('../controller/application.controller');
const parentController = require('../controller/parent.controller')
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');
const checkDatabaseConnection = require('../middleware/database.middleware');
router.use(checkDatabaseConnection);


const adminRegisterLimiter = rateLimit({
    max: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many admin registration attempts, please try again in an hour'
});


router.post('/register-admin', adminRegisterLimiter, authController.registerAdmin);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post('/create-student-account/:token', applicationController.createStudentAccount);
router.post('/create-tutor-account/:token', applicationController.createTutorAccount);
router.post('/create-parent-account/:token', parentController.createParentAccount);


module.exports = router;