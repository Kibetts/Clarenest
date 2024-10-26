const express = require('express');
const parentController = require('../controller/parent.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/roles');

const router = express.Router();

router.use(authenticateJWT);

router.post('/register/:studentId', parentController.registerParent);
router.post('/verify/:token', parentController.verifyParentAccount);

router
    .route('/')
    .get(authorizeRoles(ROLES.ADMIN), parentController.getAllParents)
    .post(authorizeRoles(ROLES.ADMIN), parentController.createParent);

router
    .route('/:id')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.getParent)
    .patch(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.updateParent)
    .delete(authorizeRoles(ROLES.ADMIN), parentController.deleteParent);

router
    .route('/:id/finances')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.getParentFinances)
    .patch(authorizeRoles(ROLES.ADMIN), parentController.updateParentFinances);


router
    .route('/:id/children')
    .get(authorizeRoles(ROLES.ADMIN, ROLES.PARENT), parentController.getParentChildren);


router.get('/child/:childId/assessments', authorizeRoles(ROLES.PARENT), parentController.getChildAssessments);

module.exports = router;