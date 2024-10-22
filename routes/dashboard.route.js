const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const dashboardController = require('../controller/dashboard.controller');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router.get('/student', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentDashboard);
router.get('/tutor', authorizeRoles(ROLES.TUTOR), dashboardController.getTutorDashboard);
router.get('/parent', authorizeRoles(ROLES.PARENT), dashboardController.getParentDashboard);
router.get('/admin', authorizeRoles(ROLES.ADMIN), dashboardController.getAdminDashboard);

module.exports = router;