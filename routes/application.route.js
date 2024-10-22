// const express = require('express');
// const router = express.Router();
// const applicationController = require('../controller/application.controller');
// const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
// const { ROLES } = require('../config/roles');

// router.post('/tutor', applicationController.submitTutorApplication);
// router.post('/student', applicationController.submitStudentApplication);

// router.use(authenticateJWT);

// router.get('/tutor/:id', authorizeRoles(ROLES.ADMIN), applicationController.getTutorApplication);
// router.get('/student/:id', authorizeRoles(ROLES.ADMIN), applicationController.getStudentApplication);

// router.patch('/tutor/:id', authorizeRoles(ROLES.ADMIN), applicationController.updateTutorApplicationStatus);
// router.patch('/student/:id', authorizeRoles(ROLES.ADMIN), applicationController.updateStudentApplicationStatus);

// router.get('/tutor', authorizeRoles(ROLES.ADMIN), applicationController.getAllTutorApplications);
// router.get('/student', authorizeRoles(ROLES.ADMIN), applicationController.getAllStudentApplications);

// router.patch('/student/:id/approve', authorizeRoles(ROLES.ADMIN), applicationController.approveStudentApplication);
// router.post('/student/create-account/:token', applicationController.createStudentAccount);

// router.patch('/tutor/:id/approve', authorizeRoles(ROLES.ADMIN), applicationController.approveTutorApplication);
// router.post('/tutor/create-account/:token', applicationController.createTutorAccount);



// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const applicationController = require('../controller/application.controller');
// const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
// const { ROLES } = require('../config/roles');

// // Public routes
// router.post('/student', applicationController.submitStudentApplication);
// router.post('/tutor', applicationController.submitTutorApplication);

// // Protected routes
// router.use(authenticateJWT);

// // Admin only routes
// router.use(authorizeRoles(ROLES.ADMIN));

// router.get('/', applicationController.getAllApplications);
// router.get('/:type/:id', applicationController.getApplicationById);
// router.patch('/:type/:id', applicationController.updateApplication);
// router.post('/student/:id/approve', applicationController.approveStudentApplication);
// router.post('/tutor/:id/approve', applicationController.approveTutorApplication);
// router.post('/:type/:id/reject', applicationController.rejectApplication);

// module.exports = router;

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