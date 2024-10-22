// const express = require('express');
// const assignmentController = require('../controller/assignment.controller');
// const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
// const { ROLES } = require('../config/roles');
// const upload = require('../middleware/fileUpload.middleware');
// const checkFeesPaid = require('../middleware/checkFees.middleware')

// const router = express.Router();

// router.use(authenticateJWT);
// router.use(checkFeesPaid);

// router
//     .route('/')
//     .get(assignmentController.getAllAssignments)
//     .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.createAssignment);

// router
//     .route('/:id')
//     .get(assignmentController.getAssignment)
//     .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.updateAssignment)
//     .delete(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.deleteAssignment);

// router.post(
//     '/:id/submit',
//     authorizeRoles(ROLES.STUDENT),
//     upload.array('files', 5), // Allow up to 5 file uploads
//     assignmentController.submitAssignment
// );

// module.exports = router;

const express = require('express');
const assignmentController = require('../controller/assignment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const checkFeesPaid = require('../middleware/checkFees.middleware');
const { ROLES } = require('../config/roles');
const upload = require('../middleware/fileUpload.middleware')

const router = express.Router();

router.use(authenticateJWT);

router
    .route('/')
    .get(checkFeesPaid, assignmentController.getAllAssignments)
    .post(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.createAssignment);

router
    .route('/:id')
    .get(checkFeesPaid, assignmentController.getAssignment)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.updateAssignment)
    .delete(authorizeRoles(ROLES.ADMIN, ROLES.TUTOR), assignmentController.deleteAssignment);

router.post(
        '/:id/submit',
        authorizeRoles(ROLES.STUDENT),
        upload.array('files', 5), // Allow up to 5 file uploads
        assignmentController.submitAssignment
    );

module.exports = router;