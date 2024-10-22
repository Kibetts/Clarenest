const express = require('express');
const router = express.Router();
const applicationController = require('../controller/application.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

// Public routes
router.post('/student', applicationController.submitStudentApplication);
router.post('/tutor', applicationController.submitTutorApplication);

// Protected routes
router.use(authenticateJWT);

// Admin only routes
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/', applicationController.getAllApplications);
router.get('/:type/:id', applicationController.getApplicationById);
router.patch('/:type/:id', applicationController.updateApplication);
router.post('/student/:id/approve', applicationController.approveStudentApplication);
router.post('/tutor/:id/approve', applicationController.approveTutorApplication);
router.post('/:type/:id/reject', applicationController.rejectApplication);

module.exports = router;