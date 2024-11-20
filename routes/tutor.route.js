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

// Create Assignment Route
router.get('/create-assignment', authorizeRoles(ROLES.TUTOR), (req, res) => {
    res.render('tutor/create-assignment');
});

// Schedule Assessment Route
router.get('/schedule-assessment', authorizeRoles(ROLES.TUTOR), (req, res) => {
    res.render('tutor/schedule-assessment');
});

// Mark Attendance Route
router.get('/mark-attendance', authorizeRoles(ROLES.TUTOR), (req, res) => {
    res.render('tutor/mark-attendance');
});

// Messages Route
router.get('/messages', authorizeRoles(ROLES.TUTOR), (req, res) => {
    res.render('tutor/messages');
});

module.exports = router;