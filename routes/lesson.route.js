// const express = require('express');
// const classController = require('../controller/lesson.controller');
// const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
// const checkFeesPaid = require('../middleware/checkFees.middleware');
// const { ROLES } = require('../config/roles');

// const router = express.Router();

// router.use(authenticateJWT);

// router
//     .route('/')
//     .get(checkFeesPaid, classController.getAllClasses)
//     .post(authorizeRoles(ROLES.ADMIN), classController.createClass);

// router
//     .route('/:id')
//     .get(checkFeesPaid, classController.getClass)
//     .patch(authorizeRoles(ROLES.ADMIN), classController.updateClass)
//     .delete(authorizeRoles(ROLES.ADMIN), classController.deleteClass);

// router.post('/:id/enroll', authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), classController.enrollStudent);

// module.exports = router;

const express = require('express');
const lessonController = require('../controller/lesson.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const checkFeesPaid = require('../middleware/checkFees.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

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