const express = require('express');
const lessonController = require('../controller/lesson.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const checkFeesPaid = require('../middleware/checkFees.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router.get('/:lessonId/students',  lessonController.getLessonStudents);


router
    .route('/')
    .get(checkFeesPaid, lessonController.getAllLessons)
    .post(authorizeRoles(ROLES.ADMIN), lessonController.createLesson);

router
    .route('/:id')
    .get(checkFeesPaid, lessonController.getLesson)
    .patch(authorizeRoles(ROLES.ADMIN), lessonController.updateLesson)
    .delete(authorizeRoles(ROLES.ADMIN), lessonController.deleteLesson);
router.post('/:id/enroll', authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), lessonController.enrollStudent);

module.exports = router;