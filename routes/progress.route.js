const express = require('express');
const progressController = require('../controller/progress.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), progressController.getAllProgresses)
    .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), progressController.createProgress);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), progressController.getProgress)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), progressController.updateProgress)
    .delete(authorizeRoles(ROLES.ADMIN), progressController.deleteProgress);

router
    .route('/student/:studentId')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), progressController.getStudentProgress);

module.exports = router;
