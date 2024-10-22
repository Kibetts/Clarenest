const express = require('express');
const authController = require('../controller/auth.controller');
const applicationController = require('../controller/application.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/verify-otp', authController.verifyOTP);
router.get('/verify-email/:token', applicationController.verifyEmail);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post('/create-student-account/:token', applicationController.createStudentAccount);
router.post('/create-tutor-account/:token', applicationController.createTutorAccount);

module.exports = router;