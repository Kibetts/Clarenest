const express = require('express');
const resultController = require('../controller/result.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), resultController.getAllResults)
    .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), resultController.createResult);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), resultController.getResult)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), resultController.updateResult)
    .delete(authorizeRoles(ROLES.ADMIN), resultController.deleteResult);

router
    .route('/student/:studentId')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR, ROLES.STUDENT, ROLES.PARENT), resultController.getStudentResults);

module.exports = router;