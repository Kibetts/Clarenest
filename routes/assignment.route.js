const express = require('express');
const assignmentController = require('../controller/assignment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const checkFeesPaid = require('../middleware/checkFees.middleware');
const { ROLES } = require('../config/roles');
const uploadMiddleware = require('../middleware/fileUpload.middleware');

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(checkFeesPaid, assignmentController.getAllAssignments)
    .post(
        authorizeRoles(ROLES.ADMIN, ROLES.TUTOR),
        uploadMiddleware.single('assignmentFile'),
        assignmentController.createAssignment
    );

router
    .route('/:id')
    .get(checkFeesPaid, assignmentController.getAssignment)
    .patch(
        authorizeRoles(ROLES.ADMIN, ROLES.TUTOR),
        uploadMiddleware.single('assignmentFile'),
        assignmentController.updateAssignment
    )
    .delete(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.deleteAssignment);

router.post(
    '/:id/submit',
    authorizeRoles(ROLES.STUDENT),
    uploadMiddleware.array('files', 5),
    assignmentController.submitAssignment
);

module.exports = router;