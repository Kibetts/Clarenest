const express = require('express');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const dashboardController = require('../controller/dashboard.controller');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

// Main dashboard routes
router.get('/student', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentDashboard);
router.get('/tutor', authorizeRoles(ROLES.TUTOR), dashboardController.getTutorDashboard);
router.get('/parent', authorizeRoles(ROLES.PARENT), dashboardController.getParentDashboard);
router.get('/admin', authorizeRoles(ROLES.ADMIN), dashboardController.getAdminDashboard);

// Student dashboard feature routes
router.get('/student/courses', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentCourses);
router.get('/student/materials', authorizeRoles(ROLES.STUDENT), dashboardController.getCourseMaterials);
router.get('/student/assignments', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentAssignments);
router.get('/student/assessments', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentAssessments); // Added this
router.get('/student/grades', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentGrades);
router.get('/student/attendance', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentAttendance);
router.get('/student/messages', authorizeRoles(ROLES.STUDENT), dashboardController.getStudentMessages);

module.exports = router;