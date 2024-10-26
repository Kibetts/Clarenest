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

// router.get('/student/courses', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentCourses);
// router.get('/student/materials/:courseId', authorizeRoles(ROLES.STUDENT), dashboardController.getCourseMaterials);
// router.get('/tutor/student-performance/:studentId', authorizeRoles(ROLES.TUTOR), dashboardController.getStudentPerformance);
// router.get('/admin/system-overview', authorizeRoles(ROLES.ADMIN), dashboardController.getSystemOverview);
// router.get('/parent/child-performance/:childId', authorizeRoles(ROLES.PARENT), dashboardController.getChildPerformance);


module.exports = router;