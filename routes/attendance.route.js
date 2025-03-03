const express = require('express');
const attendanceController = require('../controller/attendance.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), attendanceController.getAllAttendances)
    .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), attendanceController.createAttendance);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), attendanceController.getStudentAttendance)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), attendanceController.updateAttendance)
    .delete(authorizeRoles(ROLES.ADMIN), attendanceController.deleteAttendance);

router
    .route('/class/:classId')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), attendanceController.getAttendanceByLesson);

module.exports = router;