const express = require('express');
const assessmentController = require('../controller/assessment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);


router.post(
    '/distribute',authorizeRoles(ROLES.TUTOR),assessmentController.distributeToParents);

router.get(
    '/:assessmentId/download',authorizeRoles(ROLES.PARENT),assessmentController.downloadAssessment);

router
    .route('/')
    .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assessmentController.createAssessment)
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assessmentController.getAllAssessments);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT), assessmentController.getAssessment)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assessmentController.updateAssessment)
    .delete(authorizeRoles(ROLES.ADMIN), assessmentController.deleteAssessment);

router.get('/student', authorizeRoles(ROLES.STUDENT), assessmentController.getStudentAssessments);
router.post('/submit/:id', authorizeRoles(ROLES.STUDENT), assessmentController.submitAssessment);
router.get('/results', authorizeRoles(ROLES.STUDENT), assessmentController.getStudentAssessmentResults);


module.exports = router;