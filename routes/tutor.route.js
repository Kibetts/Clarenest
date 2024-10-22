const express = require('express');
const tutorController = require('../controller/tutor.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN), tutorController.getAllTutors)
    .post(authorizeRoles(ROLES.ADMIN), tutorController.createTutor);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), tutorController.getTutor)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), tutorController.updateTutor)
    .delete(authorizeRoles(ROLES.ADMIN), tutorController.deleteTutor);

router
    .route('/:id/classes')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), tutorController.getTutorLessons);

router
    .route('/:id/reviews')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), tutorController.getTutorReviews)
    .post(authorizeRoles(ROLES.STUDENT), tutorController.addTutorReview);

    router
    .route('/:id/reviews')
    .get(tutorController.getTutorReviews)
    .post(authorizeRoles(ROLES.STUDENT), tutorController.addTutorReview);

router
    .route('/:id/reviews/:reviewId')
    .patch(authorizeRoles(ROLES.STUDENT), tutorController.updateTutorReview)
    .delete(authorizeRoles(ROLES.STUDENT, ROLES.ADMIN), tutorController.deleteTutorReview);

router
    .route('/:id/status')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), tutorController.getTutorStatus)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), tutorController.updateTutorStatus);

router
    .route('/:id/classes')
    .post(authorizeRoles(ROLES.ADMIN), tutorController.assignLessonToTutor)
    .delete(authorizeRoles(ROLES.ADMIN), tutorController.removeLessonFromTutor);

router
    .route('/:id/availability')
    .get(tutorController.getTutorAvailability)
    .patch(authorizeRoles(ROLES.TUTOR, ROLES.ADMIN), tutorController.updateTutorAvailability);

module.exports = router;