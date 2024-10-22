const express = require('express');
const studentController = require('../controller/student.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), studentController.getAllStudents)
    .post(authorizeRoles(ROLES.ADMIN), studentController.createStudent);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), studentController.getStudent)
    .patch(authorizeRoles(ROLES.ADMIN), studentController.updateStudent)
    .delete(authorizeRoles(ROLES.ADMIN), studentController.deleteStudent);

router
    .route('/:id/subjects')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), studentController.getStudentSubjects);

router
    .route('/:id/attendance')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), studentController.getStudentAttendance);

router
    .route('/:id/status')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT), studentController.getStudentStatus)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.STUDENT), studentController.updateStudentStatus);


module.exports = router;
