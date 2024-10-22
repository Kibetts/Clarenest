// const express = require('express');
// const courseController = require('../controller/subject.controller');
// const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
// const { ROLES } = require('../config/roles');

// const router = express.Router();

// router.use(authenticateJWT);

// router
//     .route('/')
//     .get(courseController.getAllCourses)
//     .post(authorizeRoles(ROLES.ADMIN), courseController.createCourse);

// router
//     .route('/:id')
//     .get(courseController.getCourse)
//     .patch(authorizeRoles(ROLES.ADMIN), courseController.updateCourse)
//     .delete(authorizeRoles(ROLES.ADMIN), courseController.deleteCourse);

// module.exports = router;

const express = require('express');
const subjectController = require('../controller/subject.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(subjectController.getAllSubjects)
    .post(authorizeRoles(ROLES.ADMIN), subjectController.createSubject);

router
    .route('/:id')
    .get(subjectController.getSubject)
    .patch(authorizeRoles(ROLES.ADMIN), subjectController.updateSubject)
    .delete(authorizeRoles(ROLES.ADMIN), subjectController.deleteSubject);

module.exports = router;